import axios from 'axios';

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sheets.googleapis.com/v4/spreadsheets';
const USE_BACKEND_PROXY = !!import.meta.env.VITE_API_BASE_URL;

/**
 * Google Sheets API Service
 * Supports both direct API access and backend proxy
 */
class GoogleSheetsService {
  /**
   * Fetch data from a specific range in the spreadsheet
   */
  async getRange(range) {
    try {
      if (USE_BACKEND_PROXY) {
        // Use backend proxy (for Service Account)
        const url = `${BASE_URL}/api/sheets/range/${encodeURIComponent(range)}`;
        const response = await axios.get(url);
        return response.data.data || [];
      } else {
        // Direct API call (for API Key)
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`;
        const response = await axios.get(url, {
          params: { key: API_KEY },
        });
        return response.data.values || [];
      }
    } catch (error) {
      console.error('Error fetching range:', error);
      throw new Error(`Failed to fetch data from range: ${range}`);
    }
  }

  /**
   * Fetch multiple ranges at once (more efficient)
   */
  async getBatchRanges(ranges) {
    try {
      if (USE_BACKEND_PROXY) {
        // Use backend proxy
        const url = `${BASE_URL}/api/sheets/batch`;
        const response = await axios.post(url, { ranges });
        return response.data.data || {};
      } else {
        // Direct API call
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet`;
        const response = await axios.get(url, {
          params: {
            ranges: ranges,
            key: API_KEY,
          },
        });
        
        const result = {};
        response.data.valueRanges.forEach((valueRange, index) => {
          result[ranges[index]] = valueRange.values || [];
        });
        
        return result;
      }
    } catch (error) {
      console.error('Error fetching batch ranges:', error);
      throw new Error('Failed to fetch batch data');
    }
  }

  /**
   * Get all sheets metadata
   * @returns {Promise<Array>} - Array of sheet names and properties
   */
  async getSheetMetadata() {
    try {
      const url = `${BASE_URL}/${SPREADSHEET_ID}`;
      const response = await axios.get(url, {
        params: {
          key: API_KEY,
          fields: 'sheets.properties',
        },
      });
      
      return response.data.sheets.map(sheet => ({
        name: sheet.properties.title,
        id: sheet.properties.sheetId,
        index: sheet.properties.index,
      }));
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw new Error('Failed to fetch sheet metadata');
    }
  }

  /**
   * Helper: Parse date from MM/DD/YYYY format (US date format)
   */
  parseDate(dateString) {
    if (!dateString) return null;
    
    // Format: MM/DD/YYYY (US format)
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    
    const month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed (0 = January)
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    const date = new Date(year, month, day);
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.error('[parseDate] Invalid date:', { dateString, month: month + 1, day, year });
      return null;
    }
    
    return date;
  }

  /**
   * Helper: Filter records by date range
   */
  filterByDateRange(records, dateRange) {
    if (!dateRange || !dateRange.start || !dateRange.end) {
      console.log('[filterByDateRange] No date range filter, returning all', records.length, 'records');
      return records; // No filter, return all
    }
    
    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    console.log('[filterByDateRange] Filtering records between:', {
      start: startDate.toISOString(),
      startLocal: startDate.toString(),
      end: endDate.toISOString(),
      endLocal: endDate.toString(),
      totalRecords: records.length
    });
    
    let matchCount = 0;
    let sampleDates = [];
    
    const filtered = records.filter((row, index) => {
      const dateStr = row[3]; // Date column
      
      // Log first 5 raw dates to see format
      if (index < 5) {
        sampleDates.push(dateStr);
      }
      
      const recordDate = this.parseDate(dateStr);
      
      if (!recordDate) {
        return false;
      }
      
      const isInRange = recordDate >= startDate && recordDate <= endDate;
      
      if (isInRange) {
        matchCount++;
        // Log first 3 matches only to avoid console spam
        if (matchCount <= 3) {
          console.log('[filterByDateRange] Sample match', matchCount, ':', {
            dateStr,
            recordDate: recordDate.toISOString(),
            recordDateLocal: recordDate.toString(),
            courier: row[2]
          });
        }
      }
      
      return isInRange;
    });
    
    console.log('[filterByDateRange] Sample raw dates from data:', sampleDates);
    console.log('[filterByDateRange] Result:', filtered.length, 'records matched out of', records.length);
    
    return filtered;
  }

  /**
   * Helper: Deduplicate records by courier ID + date
   * If same courier has multiple entries on same date, keep only the first one
   */
  deduplicateByIdAndDate(records) {
    const uniqueRecords = {};
    
    records.forEach(row => {
      const courierId = row[1]; // ID column
      const dateStr = row[3]; // Date column
      
      if (!courierId || !dateStr) return;
      
      // Create unique key: courierId + date
      const uniqueKey = `${courierId}_${dateStr}`;
      
      // If duplicate, skip (keep the first one)
      if (!uniqueRecords[uniqueKey]) {
        uniqueRecords[uniqueKey] = row;
      }
    });
    
    return Object.values(uniqueRecords);
  }

  /**
   * Parse KPI data from raw sheet
   * Formulas based on canvas spreadsheet:
   * 1. WEEKLY AVG PRODUCTIVITY = Total Delivered ÷ Active Shifts
   * 2. DEDICATED VS PLUS = (2W Kurir Plus Avg) ÷ (2W Dedicated Avg) × 100
   * 3. DAILY ACTIVE = Active Shifts (Deliv>0) ÷ (Total Couriers × Operating Days) × 100
   */
  async getKPIMetrics(filters = {}) {
    try {
      // Get courier data from raw sheet
      // Columns: District(0), ID(1), Name(2), Date(3), Driver Name(4), Contract Type(5), 
      //          Vehicle Type(6), Zone ID(7), Assigned(8), Assigned Target(9), Assigned Progress(10),
      //          Delivery Progress(11), Handed Over(12), Delivered(13), Delivered(%)(14), 
      //          Delivering(#)(15), Delivering(%)(16), Failed Delivery(#)(17), Failed Delivery(%)(18),
      //          Stuck at Delivering(19), Onhold(20)
      const data = await this.getRange('raw!A2:Z'); // Skip header row
      
      if (!data || data.length === 0) {
        return this.getMockKPIData();
      }

      // Filter active records (has Delivered value)
      let activeRecords = data.filter(row => 
        row[13] && this.parseNumeric(row[13]) > 0
      );

      // Apply date range filter if provided
      activeRecords = this.filterByDateRange(activeRecords, filters.dateRange);

      // Deduplicate: 1 courier per date only
      activeRecords = this.deduplicateByIdAndDate(activeRecords);

      if (activeRecords.length === 0) {
        return this.getMockKPIData();
      }

      // === KPI 1: WEEKLY AVG PRODUCTIVITY ===
      const totalDelivered = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[13]), 0
      );
      const totalActiveShifts = activeRecords.length;
      const weeklyAvgProductivity = totalActiveShifts > 0 
        ? totalDelivered / totalActiveShifts 
        : 0;

      // Calculate target (weighted average based on contract/vehicle distribution)
      const avgTarget = activeRecords.reduce((sum, row) => {
        const target = this.getTargetByContractAndVehicle(row[5], row[6]);
        return sum + target;
      }, 0) / totalActiveShifts;

      const productivityProgress = avgTarget > 0 
        ? (weeklyAvgProductivity / avgTarget) * 100 
        : 0;

      // === KPI 2: DEDICATED VS PLUS (2WH only) ===
      const kurirPlus2WH = activeRecords.filter(row => 
        row[5]?.includes('Kurir Plus') && row[6] === '2WH'
      );
      const dedicated2WH = activeRecords.filter(row => 
        row[5] === 'Dedicated' && row[6] === '2WH'
      );

      const kurirPlusAvg = kurirPlus2WH.length > 0
        ? kurirPlus2WH.reduce((sum, row) => sum + this.parseNumeric(row[13]), 0) / kurirPlus2WH.length
        : 0;

      const dedicatedAvg = dedicated2WH.length > 0
        ? dedicated2WH.reduce((sum, row) => sum + this.parseNumeric(row[13]), 0) / dedicated2WH.length
        : 0;

      const dedicatedVsPlus = dedicatedAvg > 0 
        ? (kurirPlusAvg / dedicatedAvg) * 100 
        : 0;

      const dedicatedVsPlusDiff = 100 - dedicatedVsPlus;

      // === KPI 3: DAILY ACTIVE (2WH, Dedicated+Kurir Plus only, Deliv>0) ===
      // STATIC: Only count Dedicated 2WH + Kurir Plus 2WH couriers
      const filtered2WHDedicatedPlus = data.filter(row => 
        row[6] === '2WH' && 
        (row[5] === 'Dedicated' || row[5]?.includes('Kurir Plus')) &&
        row[13] && this.parseNumeric(row[13]) > 0
      );

      // Get unique couriers from FILTERED data (only Dedicated 2WH + Plus 2WH)
      const uniqueCouriers = new Set(filtered2WHDedicatedPlus.map(row => row[1]));
      const totalUniqueCouriers = uniqueCouriers.size;

      // Get unique dates to determine operating days
      const uniqueDates = new Set(filtered2WHDedicatedPlus.map(row => row[3]));
      const operatingDays = uniqueDates.size || 6; // Default to 6 if can't determine

      const activeShiftsFiltered = filtered2WHDedicatedPlus.length;
      const dailyActiveRate = (totalUniqueCouriers > 0 && operatingDays > 0)
        ? (activeShiftsFiltered / (totalUniqueCouriers * operatingDays)) * 100
        : 0;

      const avgCouriersPerDay = operatingDays > 0 
        ? activeShiftsFiltered / operatingDays 
        : 0;

      return {
        weeklyProductivity: {
          value: parseFloat(weeklyAvgProductivity.toFixed(1)),
          target: parseFloat(avgTarget.toFixed(1)),
          unit: 'DELIVERED / COURIER / SHIFT',
          progress: parseFloat(productivityProgress.toFixed(1)),
          label: 'WEEKLY AVG PRODUCTIVITY',
          badge: 'CORE KPI',
          subMetrics: {
            totalVolume: totalDelivered,
            activeShifts: totalActiveShifts,
            shiftTarget: parseFloat(avgTarget.toFixed(1)),
            formula: 'Total Deliv ÷ Total Active Shifts'
          }
        },
        dedicatedVsPlus: {
          value: parseFloat(dedicatedVsPlus.toFixed(1)),
          unit: '%',
          label: 'DEDICATED VS PLUS',
          badge: '2WH FLEET',
          diff: parseFloat(dedicatedVsPlusDiff.toFixed(1)),
          subMetrics: {
            kurirPlusAvg: parseFloat(kurirPlusAvg.toFixed(1)),
            dedicatedAvg: parseFloat(dedicatedAvg.toFixed(1)),
            kurirPlusCount: kurirPlus2WH.length,
            dedicatedCount: dedicated2WH.length,
            formula: '(2W Plus ÷ 2w Dedicated) × 100'
          }
        },
        dailyActive: {
          value: parseFloat(dailyActiveRate.toFixed(1)),
          unit: '%',
          label: 'DAILY ACTIVE',
          badge: 'DELIV >0',
          filters: '2W | D(0)+PLUS | DELIV >0',
          subMetrics: {
            activeShifts: activeShiftsFiltered,
            totalCouriers: totalUniqueCouriers,
            operatingDays: operatingDays,
            avgCouriersPerDay: parseFloat(avgCouriersPerDay.toFixed(1)),
            formula: 'Active Shifts ÷ (Unique Headcount × Op Days)'
          }
        }
      };
    } catch (error) {
      console.error('Error parsing KPI metrics:', error);
      return this.getMockKPIData();
    }
  }

  /**
   * Parse secondary metrics from raw data
   * Metrics: Unique Headcount, Total Delivered, Met Quota, Total Assigned, Exceptions
   */
  async getSummaryMetrics(filters = {}) {
    try {
      const data = await this.getRange('raw!A2:Z');
      
      if (!data || data.length === 0) {
        return this.getMockSummaryData();
      }

      // Filter active records (Delivered > 0)
      let activeRecords = data.filter(row => 
        row[13] && this.parseNumeric(row[13]) > 0
      );

      // Apply date range filter if provided
      activeRecords = this.filterByDateRange(activeRecords, filters.dateRange);

      // Deduplicate: 1 courier per date only
      activeRecords = this.deduplicateByIdAndDate(activeRecords);

      // UNIQUE HEADCOUNT: Unique couriers with Delivered > 0
      const uniqueCouriers = new Set(activeRecords.map(row => row[1])); // ID column
      const uniqueHeadcount = uniqueCouriers.size;
      const activeShifts = activeRecords.length;

      // TOTAL DELIVERED
      const totalDelivered = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[13]), 0
      );

      // TOTAL ASSIGNED (use Handed Over as baseline)
      const totalHandedOver = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[12]), 0
      );

      // Success Rate = Delivered / Handed Over
      const successRate = totalHandedOver > 0 
        ? (totalDelivered / totalHandedOver) * 100 
        : 0;

      // MET QUOTA: Count couriers who met target
      // Group by courier ID and calculate avg productivity
      const courierProductivity = {};
      activeRecords.forEach(row => {
        const courierId = row[1];
        const delivered = this.parseNumeric(row[13]);
        const contractType = row[5];
        const vehicleType = row[6];
        
        if (!courierProductivity[courierId]) {
          courierProductivity[courierId] = {
            totalDelivered: 0,
            shifts: 0,
            contractType,
            vehicleType
          };
        }
        courierProductivity[courierId].totalDelivered += delivered;
        courierProductivity[courierId].shifts++;
      });

      // Count how many met target
      let metQuota = 0;
      Object.values(courierProductivity).forEach(courier => {
        const avgProductivity = courier.totalDelivered / courier.shifts;
        const target = this.getTargetByContractAndVehicle(
          courier.contractType, 
          courier.vehicleType
        );
        if (avgProductivity >= target) {
          metQuota++;
        }
      });

      const metQuotaPercentage = uniqueHeadcount > 0 
        ? (metQuota / uniqueHeadcount) * 100 
        : 0;
      const underTarget = uniqueHeadcount - metQuota;

      // TOTAL ASSIGNED (for display)
      const totalAssigned = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[8]), 0
      );

      // EXCEPTIONS: Failed Deliveries
      const totalFailed = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[17]), 0 // Failed Delivery (#)
      );

      const failureRate = totalHandedOver > 0 
        ? (totalFailed / totalHandedOver) * 100 
        : 0;

      // On-hold and stuck deliveries
      const totalOnhold = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[20]), 0
      );
      const totalStuck = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[19]), 0
      );

      return {
        uniqueHeadcount: {
          value: uniqueHeadcount,
          label: 'UNIQUE HEADCOUNT',
          subtitle: 'Daily > 0',
          detail: `${activeShifts} active shifts`,
          detail2: 'Deliv > 0'
        },
        totalDelivered: {
          value: totalDelivered,
          label: 'TOTAL DELIVERED',
          subtitle: `${successRate.toFixed(1)}%`,
          detail: `of ${totalHandedOver.toLocaleString()} avg`,
          detail2: 'Delivered'
        },
        metQuota: {
          value: metQuota,
          label: 'MET QUOTA',
          subtitle: `${Math.round(metQuotaPercentage)}%`,
          detail: `${underTarget} under tgt`,
          detail2: 'Target Hit!'
        },
        totalAssigned: {
          value: totalAssigned,
          label: 'TOTAL ASSIGNED',
          subtitle: 'Volume',
          detail: `tgt ${totalHandedOver.toLocaleString()}`,
          detail2: 'Assigned'
        },
        exceptions: {
          value: totalFailed,
          label: 'EXCEPTIONS',
          subtitle: `${failureRate.toFixed(1)}%`,
          detail: `${totalFailed} fail x ${totalOnhold} hld`,
          detail2: `${totalStuck} stick`
        }
      };
    } catch (error) {
      console.error('Error parsing summary metrics:', error);
      return this.getMockSummaryData();
    }
  }

  getMockSummaryData() {
    return {
      uniqueHeadcount: {
        value: 79,
        label: 'UNIQUE HEADCOUNT',
        subtitle: 'Daily > 0',
        detail: '389 active shifts',
        detail2: 'Deliv > 0'
      },
      totalDelivered: {
        value: 39771,
        label: 'TOTAL DELIVERED',
        subtitle: '96.2%',
        detail: 'of 41,334 avg',
        detail2: 'Delivered'
      },
      metQuota: {
        value: 22,
        label: 'MET QUOTA',
        subtitle: '28%',
        detail: '57 under tgt',
        detail2: 'Target Hit!'
      },
      totalAssigned: {
        value: 41334,
        label: 'TOTAL ASSIGNED',
        subtitle: 'Volume',
        detail: 'tgt 42,717',
        detail2: 'Assigned'
      },
      exceptions: {
        value: 1155,
        label: 'EXCEPTIONS',
        subtitle: '2.8%',
        detail: '1155 fail x 0 hld',
        detail2: '0 stick'
      }
    };
  }

  /**
   * Get performance by contract type data
   * Success Rate = Delivered ÷ Handed Over × 100
   * Shows: Contract Type, Couriers Count, Delivered/Total, Success %, Failed count
   */
  async getPerformanceByContract(filters = {}) {
    try {
      const data = await this.getRange('raw!A2:Z');
      
      if (!data || data.length === 0) {
        return this.getMockPerformanceData();
      }

      // Filter active records only
      let activeRecords = data.filter(row => 
        row[13] && this.parseNumeric(row[13]) > 0
      );

      // Apply date range filter if provided
      activeRecords = this.filterByDateRange(activeRecords, filters.dateRange);

      // Deduplicate: 1 courier per date only
      activeRecords = this.deduplicateByIdAndDate(activeRecords);

      // Group by contract type (column index 5)
      const contractGroups = {};
      activeRecords.forEach(row => {
        const contract = row[5] || ''; // Contract Type
        
        // Skip if empty or Unknown
        if (!contract || contract.toLowerCase().includes('unknown')) {
          return;
        }
        
        if (!contractGroups[contract]) {
          contractGroups[contract] = {
            couriers: new Set(),
            totalDelivered: 0,
            totalHandedOver: 0,
            totalFailed: 0
          };
        }
        contractGroups[contract].couriers.add(row[1]); // Unique courier ID
        contractGroups[contract].totalDelivered += this.parseNumeric(row[13]) || 0; // Delivered
        contractGroups[contract].totalHandedOver += this.parseNumeric(row[12]) || 0; // Handed Over
        contractGroups[contract].totalFailed += this.parseNumeric(row[17]) || 0; // Failed Delivery (#)
      });

      // Convert to array format and sort by couriers count
      return Object.keys(contractGroups)
        .map(contractType => {
          const group = contractGroups[contractType];
          const couriersCount = group.couriers.size;
          const successRate = group.totalHandedOver > 0 
            ? (group.totalDelivered / group.totalHandedOver) * 100 
            : 0;
          
          return {
            contractType,
            couriers: couriersCount,
            delivered: group.totalDelivered,
            total: group.totalHandedOver,
            successRate: parseFloat(successRate.toFixed(1)),
            failed: group.totalFailed
          };
        })
        .filter(item => item.couriers > 0)
        .sort((a, b) => b.couriers - a.couriers); // Sort by number of couriers descending
    } catch (error) {
      console.error('Error parsing performance data:', error);
      return this.getMockPerformanceData();
    }
  }

  /**
   * Get top zones by parcel volume
   * Shows: Zone ID, Delivered volume, Total (Delivered/Handed Over), Success %
   */
  async getTopZones(filters = {}) {
    try {
      const data = await this.getRange('raw!A2:Z');
      
      if (!data || data.length === 0) {
        return this.getMockZonesData();
      }

      // Filter active records only
      let activeRecords = data.filter(row => 
        row[13] && this.parseNumeric(row[13]) > 0
      );

      // Apply date range filter if provided
      activeRecords = this.filterByDateRange(activeRecords, filters.dateRange);

      // Deduplicate: 1 courier per date only
      activeRecords = this.deduplicateByIdAndDate(activeRecords);

      // Group by zone (column index 7)
      const zoneGroups = {};
      activeRecords.forEach(row => {
        const zone = row[7] || ''; // Zone ID
        
        // Skip if empty or Unknown
        if (!zone || zone.toLowerCase().includes('unknown')) {
          return;
        }
        
        const delivered = this.parseNumeric(row[13]) || 0; // Delivered
        const handedOver = this.parseNumeric(row[12]) || 0; // Handed Over
        
        if (!zoneGroups[zone]) {
          zoneGroups[zone] = {
            delivered: 0,
            handedOver: 0
          };
        }
        zoneGroups[zone].delivered += delivered;
        zoneGroups[zone].handedOver += handedOver;
      });

      // Convert to array and sort by delivered
      const zonesArray = Object.keys(zoneGroups)
        .map(zone => {
          const group = zoneGroups[zone];
          const successRate = group.handedOver > 0 
            ? (group.delivered / group.handedOver) * 100 
            : 0;
          
          return {
            zone,
            delivered: group.delivered,
            total: group.handedOver,
            successRate: parseFloat(successRate.toFixed(0)) // Round to integer for display
          };
        })
        .filter(z => z.delivered > 0)
        .sort((a, b) => b.delivered - a.delivered);

      // Return top 6 zones
      return zonesArray.slice(0, 6);
    } catch (error) {
      console.error('Error parsing zones data:', error);
      return this.getMockZonesData();
    }
  }

  /**
   * Get fleet composition and quota data
   * Shows: % Met Quota, 2WH count, 4WH count, Avg Target per courier
   */
  async getFleetComposition() {
    try {
      const data = await this.getRange('raw!A2:Z');
      
      if (!data || data.length === 0) {
        return this.getMockFleetData();
      }

      // Filter active records only
      const activeRecords = data.filter(row => 
        row[13] && this.parseNumeric(row[13]) > 0
      );

      // Group by vehicle type (column index 6)
      const vehicleGroups = {};
      activeRecords.forEach(row => {
        const vehicle = row[6] || 'Unknown'; // Vehicle Type
        vehicleGroups[vehicle] = (vehicleGroups[vehicle] || 0) + 1;
      });

      // Count 2WH and 4WH
      const count2WH = vehicleGroups['2WH'] || 0;
      const count4WH = vehicleGroups['4WH'] || 0;

      // Calculate Met Quota (same logic as in getSummaryMetrics)
      const courierProductivity = {};
      activeRecords.forEach(row => {
        const courierId = row[1];
        const delivered = this.parseNumeric(row[13]);
        const contractType = row[5];
        const vehicleType = row[6];
        
        if (!courierProductivity[courierId]) {
          courierProductivity[courierId] = {
            totalDelivered: 0,
            shifts: 0,
            contractType,
            vehicleType
          };
        }
        courierProductivity[courierId].totalDelivered += delivered;
        courierProductivity[courierId].shifts++;
      });

      let metQuota = 0;
      const uniqueCouriers = Object.keys(courierProductivity).length;
      
      Object.values(courierProductivity).forEach(courier => {
        const avgProductivity = courier.totalDelivered / courier.shifts;
        const target = this.getTargetByContractAndVehicle(
          courier.contractType, 
          courier.vehicleType
        );
        if (avgProductivity >= target) {
          metQuota++;
        }
      });

      const metQuotaPercentage = uniqueCouriers > 0 
        ? (metQuota / uniqueCouriers) * 100 
        : 0;

      // Calculate average target
      const totalTarget = Object.values(courierProductivity).reduce((sum, courier) => {
        return sum + this.getTargetByContractAndVehicle(
          courier.contractType, 
          courier.vehicleType
        );
      }, 0);
      const avgTargetPerCourier = uniqueCouriers > 0 
        ? totalTarget / uniqueCouriers 
        : 0;

      // Total delivered
      const totalDelivered = activeRecords.reduce((sum, row) => 
        sum + this.parseNumeric(row[13]), 0
      );

      return {
        metQuotaPercentage: parseFloat(metQuotaPercentage.toFixed(0)),
        metQuotaCount: metQuota,
        totalCouriers: uniqueCouriers,
        count2WH,
        count4WH,
        avgTargetPerCourier: Math.round(avgTargetPerCourier),
        totalPackages: totalDelivered,
      };
    } catch (error) {
      console.error('Error parsing fleet data:', error);
      return this.getMockFleetData();
    }
  }

  /**
   * Get courier schedule data with weekly aggregation
   * Groups by courier ID and calculates weekly metrics
   */
  async getCourierSchedule(filters = {}) {
    try {
      const data = await this.getRange('raw!A2:Z');
      
      if (!data || data.length === 0) {
        return this.getMockCourierData();
      }

      // Filter active records only (Delivered > 0)
      let activeRecords = data.filter(row => 
        row[13] && this.parseNumeric(row[13]) > 0
      );

      // Apply date range filter if provided
      if (filters.dateRange) {
        activeRecords = this.filterByDateRange(activeRecords, filters.dateRange);
      }

      // Map day names to Indonesian
      const dayNames = ['sen', 'sel', 'rab', 'kam', 'jum', 'sab', 'min'];
      
      // Deduplicate: 1 courier per date only (using helper function)
      const deduplicatedRecords = this.deduplicateByIdAndDate(activeRecords);
      
      // Group by courier ID for weekly aggregation
      const courierGroups = {};
      deduplicatedRecords.forEach(row => {
        const courierId = row[1]; // ID column
        if (!courierId) return;

        if (!courierGroups[courierId]) {
          courierGroups[courierId] = {
            id: courierId,
            name: row[2] || '', // Name
            district: row[0] || '', // District
            zone: row[7] || '', // Zone ID
            contract: row[5] || '', // Contract Type
            vehicle: row[6] || '', // Vehicle Type
            shifts: [],
            totalDelivered: 0,
            totalHandedOver: 0,
            activeDays: {
              sen: false,  // Senin
              sel: false,  // Selasa
              rab: false,  // Rabu
              kam: false,  // Kamis
              jum: false,  // Jumat
              sab: false,  // Sabtu
              min: false   // Minggu
            }
          };
        }

        // Add shift data (now guaranteed unique per date)
        const delivered = this.parseNumeric(row[13]);
        const handedOver = this.parseNumeric(row[12]);
        const dateStr = row[3]; // Date
        const recordDate = this.parseDate(dateStr);
        
        courierGroups[courierId].shifts.push({
          delivered,
          handedOver,
          date: dateStr,
          parsedDate: recordDate
        });
        courierGroups[courierId].totalDelivered += delivered;
        courierGroups[courierId].totalHandedOver += handedOver;

        // Mark active days based on actual date (0=Minggu, 1=Senin, etc)
        if (recordDate) {
          const dayIndex = recordDate.getDay(); // 0 = Sunday, 1 = Monday, etc
          // Convert to our day mapping (Monday-based)
          const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0=Mon, 1=Tue, ..., 6=Sun
          const dayKey = dayNames[adjustedIndex];
          courierGroups[courierId].activeDays[dayKey] = true;
        }
      });

      // Calculate metrics for each courier
      let couriers = Object.values(courierGroups).map(courier => {
        const shiftsCount = courier.shifts.length;
        const avgDaily = shiftsCount > 0 ? courier.totalDelivered / shiftsCount : 0;
        const target = this.getTargetByContractAndVehicle(courier.contract, courier.vehicle);
        const productivityPercentage = target > 0 ? (avgDaily / target) * 100 : 0;
        const successRate = courier.totalHandedOver > 0 
          ? (courier.totalDelivered / courier.totalHandedOver) * 100 
          : 0;

        return {
          ...courier,
          shiftsCount,
          avgDaily,
          target,
          productivityPercentage,
          successRate,
          totalWeekDeliv: courier.totalDelivered,
        };
      });

      // Apply filters
      if (filters.zone && filters.zone !== 'all') {
        couriers = couriers.filter(c => c.zone === filters.zone);
      }
      if (filters.contract && filters.contract !== 'all') {
        couriers = couriers.filter(c => c.contract === filters.contract);
      }
      if (filters.vehicle && filters.vehicle !== 'all') {
        couriers = couriers.filter(c => c.vehicle === filters.vehicle);
      }

      // Sort by productivity percentage descending
      couriers.sort((a, b) => b.productivityPercentage - a.productivityPercentage);

      return couriers;
    } catch (error) {
      console.error('Error parsing courier schedule:', error);
      return this.getMockCourierData();
    }
  }

  /**
   * Get target map for ALL contract+vehicle combinations for a specific week
   * Strategy: Find ONE sample Monday record for each contract+vehicle type, use that target for ALL couriers of that type
   * This ensures perfect consistency - all Dedicated+2WH have same target, all Freelance+4WH have same target, etc.
   * 
   * @param {Array} allRawRecords - ALL raw data
   * @param {Date} weekStartDate - Monday date of the week
   * @returns {Object} - Map of "contract-vehicle" -> target value
   */
  getTargetMapForWeek(allRawRecords, weekStartDate) {
    if (!weekStartDate) {
      console.warn('[getTargetMapForWeek] No weekStartDate provided');
      return {};
    }

    // Normalize weekStartDate to start of day
    const normalizedWeekStart = new Date(weekStartDate);
    normalizedWeekStart.setHours(0, 0, 0, 0);
    
    const targetMap = {};
    
    // Find all Monday records on the exact weekStartDate
    const mondayRecords = allRawRecords.filter(row => {
      const dateStr = row[3]; // Date column
      const date = this.parseDate(dateStr);
      if (!date) return false;
      
      // Normalize record date
      const normalizedRecordDate = new Date(date);
      normalizedRecordDate.setHours(0, 0, 0, 0);
      
      // Check if it's Monday AND matches weekStartDate exactly
      const dayOfWeek = date.getDay();
      const isMonday = dayOfWeek === 1;
      const isSameDate = normalizedRecordDate.getTime() === normalizedWeekStart.getTime();
      
      return isMonday && isSameDate;
    });
    
    console.log(`[getTargetMapForWeek] Found ${mondayRecords.length} Monday records on ${weekStartDate.toLocaleDateString('en-US')}`);
    
    // Group by contract+vehicle and pick first valid target for each combination
    mondayRecords.forEach(row => {
      const contractType = row[5]; // Contract column
      const vehicleType = row[6]; // Vehicle column
      const assignedTarget = this.parseNumeric(row[9]); // Assigned Target column
      
      const key = `${contractType}-${vehicleType}`;
      
      // Only set if not already set and target is valid
      if (!targetMap[key] && assignedTarget > 0) {
        targetMap[key] = assignedTarget;
        console.log(`[getTargetMapForWeek] Sample target for ${key}: ${assignedTarget} (from courier ${row[1]})`);
      }
    });
    
    return targetMap;
  }

  /**
   * Get target for a specific courier using the target map
   * Falls back to static target if no sample found for this contract+vehicle type
   * 
   * @param {Object} targetMap - Pre-calculated target map from getTargetMapForWeek()
   * @param {String} contractType - Contract type
   * @param {String} vehicleType - Vehicle type
   * @returns {Number} - Target value
   */
  getTargetFromMap(targetMap, contractType, vehicleType) {
    const key = `${contractType}-${vehicleType}`;
    
    if (targetMap[key]) {
      return targetMap[key];
    }
    
    // No sample found for this type, use static fallback
    const fallbackTarget = this.getTargetByContractAndVehicle(contractType, vehicleType);
    console.warn(`[getTargetFromMap] No Monday sample found for ${key}, using fallback: ${fallbackTarget}`);
    return fallbackTarget;
  }

  /**
   * Get target for courier based on contract type and vehicle type (FALLBACK ONLY)
   * This is now only used as fallback when Monday target is not available
   * Based on actual data analysis:
   * - Dedicated 2WH: 207-299 (avg 260.97)
   * - Dedicated 4WH: 53-104 (avg 78.75)
   * - Kurir Plus 2WH: 145-224 (avg 192.20)
   * - Mitra 2WH: 21-112 (avg 41)
   * - Mitra 4WH: 33-59 (avg 50)
   */
  getTargetByContractAndVehicle(contractType, vehicleType) {
    const targets = {
      'Dedicated': {
        '2WH': 260.97,
        '4WH': 78.75,
      },
      'Kurir Plus': {
        '2WH': 192.20,
      },
      'Mitra': {
        '2WH': 41,
        '4WH': 50,
      },
    };

    // Normalize contract type
    const contract = contractType?.trim() || 'Mitra';
    const vehicle = vehicleType?.trim() || '2WH';

    // Get target
    if (targets[contract] && targets[contract][vehicle]) {
      return targets[contract][vehicle];
    }

    // Fallback to vehicle type default
    if (vehicle === '4WH') {
      return 78.75; // Default for 4WH
    }

    return 192.20; // Default for 2WH
  }

  /**
   * Process courier schedule data from raw data cache (client-side filtering)
   * This is the core method for instant week navigation without API calls
   * @param {Array} rawData - Full raw data array (already loaded once)
   * @param {Object} dateRange - { start: Date, end: Date }
   * @param {Object} filters - { zone, contract, vehicle }
   * @returns {Array} - Processed courier schedule data
   */
  processCourierScheduleFromRaw(rawData, dateRange, filters = {}) {
    if (!rawData || rawData.length === 0) {
      console.warn('[processCourierScheduleFromRaw] No raw data provided');
      return [];
    }

    console.log('[processCourierScheduleFromRaw] Processing', {
      totalRows: rawData.length,
      dateRange: dateRange ? {
        start: dateRange.start?.toISOString(),
        end: dateRange.end?.toISOString()
      } : null,
      filters
    });

    // Filter active records only (Delivered > 0)
    let activeRecords = rawData.filter(row => 
      row[13] && this.parseNumeric(row[13]) > 0
    );

    console.log('[processCourierScheduleFromRaw] Active records (Delivered > 0):', activeRecords.length);

    // Apply date range filter if provided
    if (dateRange) {
      activeRecords = this.filterByDateRange(activeRecords, dateRange);
      console.log('[processCourierScheduleFromRaw] After date filter:', activeRecords.length);
    }

    // Deduplicate: 1 courier per date only
    activeRecords = this.deduplicateByIdAndDate(activeRecords);
    console.log('[processCourierScheduleFromRaw] After deduplication:', activeRecords.length);

    // Map day names to Indonesian
    const dayNames = ['sen', 'sel', 'rab', 'kam', 'jum', 'sab', 'min'];
    
    // Group by courier ID for weekly aggregation
    const courierGroups = {};
    activeRecords.forEach(row => {
      const courierId = row[1]; // ID column
      if (!courierId) return;

      if (!courierGroups[courierId]) {
        courierGroups[courierId] = {
          id: courierId,
          name: row[2] || '', // Name
          district: row[0] || '', // District
          zone: row[7] || '', // Zone ID
          contract: row[5] || '', // Contract Type
          vehicle: row[6] || '', // Vehicle Type
          shifts: [],
          totalDelivered: 0,
          totalHandedOver: 0,
          activeDays: {
            sen: false,  // Senin
            sel: false,  // Selasa
            rab: false,  // Rabu
            kam: false,  // Kamis
            jum: false,  // Jumat
            sab: false,  // Sabtu
            min: false   // Minggu
          }
        };
      }

      // Add shift data (now guaranteed unique per date)
      const delivered = this.parseNumeric(row[13]);
      const handedOver = this.parseNumeric(row[12]);
      const dateStr = row[3]; // Date
      const recordDate = this.parseDate(dateStr);
      
      courierGroups[courierId].shifts.push({
        delivered,
        handedOver,
        date: dateStr,
        parsedDate: recordDate
      });
      courierGroups[courierId].totalDelivered += delivered;
      courierGroups[courierId].totalHandedOver += handedOver;

      // Mark active days based on actual date (0=Minggu, 1=Senin, etc)
      if (recordDate) {
        const dayIndex = recordDate.getDay(); // 0 = Sunday, 1 = Monday, etc
        // Convert to our day mapping (Monday-based)
        const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; // 0=Mon, 1=Tue, ..., 6=Sun
        const dayKey = dayNames[adjustedIndex];
        courierGroups[courierId].activeDays[dayKey] = true;
      }
    });

    // Calculate metrics for each courier
    // Get target map for the week ONCE for all couriers
    let weekStartDate = null;
    if (dateRange && dateRange.start) {
      weekStartDate = new Date(dateRange.start);
    }
    const targetMap = weekStartDate ? this.getTargetMapForWeek(rawData, weekStartDate) : {};
    
    let couriers = Object.values(courierGroups).map(courier => {
      const shiftsCount = courier.shifts.length;
      const avgDaily = shiftsCount > 0 ? courier.totalDelivered / shiftsCount : 0;
      
      // Get target from map (ensures all same contract+vehicle have same target)
      const target = weekStartDate 
        ? this.getTargetFromMap(targetMap, courier.contract, courier.vehicle)
        : this.getTargetByContractAndVehicle(courier.contract, courier.vehicle);
        
      const productivityPercentage = target > 0 ? (avgDaily / target) * 100 : 0;
      const successRate = courier.totalHandedOver > 0 
        ? (courier.totalDelivered / courier.totalHandedOver) * 100 
        : 0;

      return {
        ...courier,
        shiftsCount,
        avgDaily,
        target,
        productivityPercentage,
        successRate,
        totalWeekDeliv: courier.totalDelivered,
      };
    });

    // Apply filters
    if (filters.zone && filters.zone !== 'all') {
      couriers = couriers.filter(c => c.zone === filters.zone);
    }
    if (filters.contract && filters.contract !== 'all') {
      couriers = couriers.filter(c => c.contract === filters.contract);
    }
    if (filters.vehicle && filters.vehicle !== 'all') {
      couriers = couriers.filter(c => c.vehicle === filters.vehicle);
    }

    // Sort by productivity percentage descending
    couriers.sort((a, b) => b.productivityPercentage - a.productivityPercentage);

    console.log('[processCourierScheduleFromRaw] Final couriers:', couriers.length);

    return couriers;
  }

  /**
   * Process Summary metrics from cached raw data (client-side filtering)
   * @param {Array} rawData - Full raw data array (already loaded once)
   * @param {Object} filters - { dateRange, contract, vehicle }
   * @returns {Object} - Summary metrics object
   */
  processSummaryMetricsFromRaw(rawData, filters = {}) {
    if (!rawData || rawData.length === 0) {
      console.warn('[processSummaryMetricsFromRaw] No raw data provided');
      return this.getMockSummaryData();
    }

    console.log('[processSummaryMetricsFromRaw] Processing with filters:', filters);

    // Filter active records (has Delivered value)
    let activeRecords = rawData.filter(row => 
      row[13] && this.parseNumeric(row[13]) > 0
    );

    console.log('[processSummaryMetricsFromRaw] Active records (Delivered > 0):', activeRecords.length);

    // Apply date range filter if provided
    if (filters.dateRange) {
      activeRecords = this.filterByDateRange(activeRecords, filters.dateRange);
      console.log('[processSummaryMetricsFromRaw] After date filter:', activeRecords.length);
    }

    // Apply contract type filter if provided
    if (filters.contract && filters.contract !== 'all') {
      activeRecords = activeRecords.filter(row => row[5] === filters.contract);
      console.log('[processSummaryMetricsFromRaw] After contract filter:', activeRecords.length);
    }

    // Apply vehicle type filter if provided
    if (filters.vehicle && filters.vehicle !== 'all') {
      activeRecords = activeRecords.filter(row => row[6] === filters.vehicle);
      console.log('[processSummaryMetricsFromRaw] After vehicle filter:', activeRecords.length);
    }

    // Deduplicate: 1 courier per date only
    activeRecords = this.deduplicateByIdAndDate(activeRecords);
    console.log('[processSummaryMetricsFromRaw] After deduplication:', activeRecords.length);

    if (activeRecords.length === 0) {
      console.warn('[processSummaryMetricsFromRaw] No data after filtering');
      return this.getMockSummaryData();
    }

    // UNIQUE HEADCOUNT: Unique couriers with Delivered > 0
    const uniqueCouriers = new Set(activeRecords.map(row => row[1])); // ID column
    const uniqueHeadcount = uniqueCouriers.size;
    const activeShifts = activeRecords.length;

    // TOTAL DELIVERED
    const totalDelivered = activeRecords.reduce((sum, row) => 
      sum + this.parseNumeric(row[13]), 0
    );

    // TOTAL HANDED OVER (use Handed Over as baseline)
    const totalHandedOver = activeRecords.reduce((sum, row) => 
      sum + this.parseNumeric(row[12]), 0
    );

    // Success Rate = Delivered / Handed Over
    const successRate = totalHandedOver > 0 
      ? (totalDelivered / totalHandedOver) * 100 
      : 0;

    // MET QUOTA: Count couriers who met target
    // Group by courier ID and calculate avg productivity
    const courierProductivity = {};
    activeRecords.forEach(row => {
      const courierId = row[1];
      const delivered = this.parseNumeric(row[13]);
      const contractType = row[5];
      const vehicleType = row[6];
      
      if (!courierProductivity[courierId]) {
        courierProductivity[courierId] = {
          totalDelivered: 0,
          shifts: 0,
          contractType,
          vehicleType
        };
      }
      courierProductivity[courierId].totalDelivered += delivered;
      courierProductivity[courierId].shifts++;
    });

    // Count how many met target (use Monday target)
    // Determine week start date from filters
    let weekStartDate = null;
    if (filters.dateRange && filters.dateRange.start) {
      weekStartDate = new Date(filters.dateRange.start);
    }
    
    // Get target map for all contract+vehicle types
    const targetMap = this.getTargetMapForWeek(rawData, weekStartDate);
    
    let metQuota = 0;
    Object.keys(courierProductivity).forEach(courierId => {
      const courier = courierProductivity[courierId];
      const avgProductivity = courier.totalDelivered / courier.shifts;
      const target = this.getTargetFromMap(
        targetMap,
        courier.contractType, 
        courier.vehicleType
      );
      if (avgProductivity >= target) {
        metQuota++;
      }
    });

    const metQuotaPercentage = uniqueHeadcount > 0 
      ? (metQuota / uniqueHeadcount) * 100 
      : 0;
    const underTarget = uniqueHeadcount - metQuota;

    // TOTAL ASSIGNED (for display)
    const totalAssigned = activeRecords.reduce((sum, row) => 
      sum + this.parseNumeric(row[8]), 0
    );

    // EXCEPTIONS: Failed Deliveries
    const totalFailed = activeRecords.reduce((sum, row) => 
      sum + this.parseNumeric(row[17]), 0 // Failed Delivery (#)
    );

    const failureRate = totalHandedOver > 0 
      ? (totalFailed / totalHandedOver) * 100 
      : 0;

    // On-hold and stuck deliveries
    const totalOnhold = activeRecords.reduce((sum, row) => 
      sum + this.parseNumeric(row[20]), 0
    );
    const totalStuck = activeRecords.reduce((sum, row) => 
      sum + this.parseNumeric(row[19]), 0
    );

    console.log('[processSummaryMetricsFromRaw] Summary results:', {
      uniqueHeadcount,
      totalDelivered,
      metQuota,
      totalAssigned,
      totalFailed,
    });

    return {
      uniqueHeadcount: {
        value: uniqueHeadcount,
        label: 'UNIQUE HEADCOUNT',
        subtitle: 'Daily > 0',
        detail: `${activeShifts} active shifts`,
        detail2: 'Deliv > 0'
      },
      totalDelivered: {
        value: totalDelivered,
        label: 'TOTAL DELIVERED',
        subtitle: `${successRate.toFixed(1)}%`,
        detail: `of ${totalHandedOver.toLocaleString()} avg`,
        detail2: 'Delivered'
      },
      metQuota: {
        value: metQuota,
        label: 'MET QUOTA',
        subtitle: `${Math.round(metQuotaPercentage)}%`,
        detail: `${underTarget} under tgt`,
        detail2: 'Target Hit!'
      },
      totalAssigned: {
        value: totalAssigned,
        label: 'TOTAL ASSIGNED',
        subtitle: 'Volume',
        detail: `tgt ${totalHandedOver.toLocaleString()}`,
        detail2: 'Assigned'
      },
      exceptions: {
        value: totalFailed,
        label: 'EXCEPTIONS',
        subtitle: `${failureRate.toFixed(1)}%`,
        detail: `${totalFailed} fail x ${totalOnhold} hld`,
        detail2: `${totalStuck} stick`
      }
    };
  }

  /**
   * Process KPI metrics from cached raw data (client-side filtering)
   * This allows dynamic filtering by date, contract, and vehicle without API calls
   * @param {Array} rawData - Full raw data array (already loaded once)
   * @param {Object} filters - { dateRange, contract, vehicle }
   * @returns {Object} - KPI metrics object
   */
  processKPIMetricsFromRaw(rawData, filters = {}) {
    if (!rawData || rawData.length === 0) {
      console.warn('[processKPIMetricsFromRaw] No raw data provided');
      return this.getMockKPIData();
    }

    console.log('[processKPIMetricsFromRaw] Processing with filters:', filters);

    // Filter active records (has Delivered value)
    let activeRecords = rawData.filter(row => 
      row[13] && this.parseNumeric(row[13]) > 0
    );

    console.log('[processKPIMetricsFromRaw] Active records (Delivered > 0):', activeRecords.length);

    // Apply date range filter if provided
    if (filters.dateRange) {
      activeRecords = this.filterByDateRange(activeRecords, filters.dateRange);
      console.log('[processKPIMetricsFromRaw] After date filter:', activeRecords.length);
    }

    // Apply contract type filter if provided
    if (filters.contract && filters.contract !== 'all') {
      activeRecords = activeRecords.filter(row => row[5] === filters.contract);
      console.log('[processKPIMetricsFromRaw] After contract filter:', activeRecords.length);
    }

    // Apply vehicle type filter if provided
    if (filters.vehicle && filters.vehicle !== 'all') {
      activeRecords = activeRecords.filter(row => row[6] === filters.vehicle);
      console.log('[processKPIMetricsFromRaw] After vehicle filter:', activeRecords.length);
    }

    // Deduplicate: 1 courier per date only
    activeRecords = this.deduplicateByIdAndDate(activeRecords);
    console.log('[processKPIMetricsFromRaw] After deduplication:', activeRecords.length);

    if (activeRecords.length === 0) {
      console.warn('[processKPIMetricsFromRaw] No data after filtering');
      return this.getMockKPIData();
    }

    // === KPI 1: WEEKLY AVG PRODUCTIVITY ===
    const totalDelivered = activeRecords.reduce((sum, row) => 
      sum + this.parseNumeric(row[13]), 0
    );
    const totalActiveShifts = activeRecords.length;
    const weeklyAvgProductivity = totalActiveShifts > 0 
      ? totalDelivered / totalActiveShifts 
      : 0;

    // Calculate target (use Monday's Assigned Target for the week)
    // Determine week start date from filters
    let weekStartDate = null;
    if (filters.dateRange && filters.dateRange.start) {
      weekStartDate = new Date(filters.dateRange.start);
    }
    
    // Get target map for all contract+vehicle types (ONE sample per type)
    const targetMap = this.getTargetMapForWeek(rawData, weekStartDate);
    
    // Group by courier to get target per courier (using the target map)
    const courierTargets = {};
    activeRecords.forEach(row => {
      const courierId = row[1];
      if (!courierTargets[courierId]) {
        const target = this.getTargetFromMap(
          targetMap,
          row[5], // contract type
          row[6]  // vehicle type
        );
        courierTargets[courierId] = target;
      }
    });
    
    // Calculate weighted average target
    const totalTargets = Object.values(courierTargets).reduce((sum, target) => sum + target, 0);
    const avgTarget = Object.keys(courierTargets).length > 0 
      ? totalTargets / Object.keys(courierTargets).length 
      : 0;

    const productivityProgress = avgTarget > 0 
      ? (weeklyAvgProductivity / avgTarget) * 100 
      : 0;

    // === KPI 2: DEDICATED VS PLUS (2WH only) ===
    // ⚠️ SPECIAL: This KPI is NOT affected by contract/vehicle filters
    // Only date filter applies - always compare ALL Dedicated vs ALL Kurir Plus 2WH
    let dedicatedVsPlusRecords = rawData.filter(row => 
      row[13] && this.parseNumeric(row[13]) > 0
    );
    
    // Apply ONLY date filter (ignore contract/vehicle filters)
    if (filters.dateRange) {
      dedicatedVsPlusRecords = this.filterByDateRange(dedicatedVsPlusRecords, filters.dateRange);
    }
    
    // Deduplicate for DEDICATED VS PLUS calculation
    dedicatedVsPlusRecords = this.deduplicateByIdAndDate(dedicatedVsPlusRecords);
    
    const kurirPlus2WH = dedicatedVsPlusRecords.filter(row => 
      row[5]?.includes('Kurir Plus') && row[6] === '2WH'
    );
    const dedicated2WH = dedicatedVsPlusRecords.filter(row => 
      row[5] === 'Dedicated' && row[6] === '2WH'
    );

    const kurirPlusAvg = kurirPlus2WH.length > 0
      ? kurirPlus2WH.reduce((sum, row) => sum + this.parseNumeric(row[13]), 0) / kurirPlus2WH.length
      : 0;

    const dedicatedAvg = dedicated2WH.length > 0
      ? dedicated2WH.reduce((sum, row) => sum + this.parseNumeric(row[13]), 0) / dedicated2WH.length
      : 0;

    const dedicatedVsPlus = dedicatedAvg > 0 
      ? (kurirPlusAvg / dedicatedAvg) * 100 
      : 0;

    const dedicatedVsPlusDiff = 100 - dedicatedVsPlus;

    // === KPI 3: DAILY ACTIVE (2WH, Dedicated+Kurir Plus only, Deliv>0) ===
    // STATIC: Always calculate from ALL raw data (not affected by ANY filters)
    // Always count ALL Dedicated 2WH + Kurir Plus 2WH regardless of user filters
    const filtered2WHDedicatedPlus = rawData.filter(row => 
      row[6] === '2WH' && 
      (row[5] === 'Dedicated' || row[5]?.includes('Kurir Plus')) &&
      row[13] && this.parseNumeric(row[13]) > 0
    );
    // NOTE: NO date filter, NO contract filter, NO vehicle filter applied here!

    // Get unique couriers from ALL Dedicated 2WH + Plus 2WH data
    const uniqueCouriers = new Set(filtered2WHDedicatedPlus.map(row => row[1]));
    const totalUniqueCouriers = uniqueCouriers.size;

    // Get unique dates to determine operating days
    const uniqueDates = new Set(filtered2WHDedicatedPlus.map(row => row[3]));
    const operatingDays = uniqueDates.size || 6; // Default to 6 if can't determine

    const activeShiftsFiltered = filtered2WHDedicatedPlus.length;
    const dailyActiveRate = (totalUniqueCouriers > 0 && operatingDays > 0)
      ? (activeShiftsFiltered / (totalUniqueCouriers * operatingDays)) * 100
      : 0;

    const avgCouriersPerDay = operatingDays > 0 
      ? activeShiftsFiltered / operatingDays 
      : 0;

    console.log('[processKPIMetricsFromRaw] KPI results:', {
      weeklyAvgProductivity: weeklyAvgProductivity.toFixed(1),
      dedicatedVsPlus: dedicatedVsPlus.toFixed(1),
      dailyActiveRate: dailyActiveRate.toFixed(1),
    });

    return {
      weeklyProductivity: {
        value: parseFloat(weeklyAvgProductivity.toFixed(1)),
        target: parseFloat(avgTarget.toFixed(1)),
        unit: 'DELIVERED / COURIER / SHIFT',
        progress: parseFloat(productivityProgress.toFixed(1)),
        label: 'WEEKLY AVG PRODUCTIVITY',
        badge: 'CORE KPI',
        subMetrics: {
          totalVolume: totalDelivered,
          activeShifts: totalActiveShifts,
          shiftTarget: parseFloat(avgTarget.toFixed(1)),
          formula: 'Total Deliv ÷ Total Active Shifts'
        }
      },
      dedicatedVsPlus: {
        value: parseFloat(dedicatedVsPlus.toFixed(1)),
        unit: '%',
        label: 'DEDICATED VS PLUS',
        badge: '2WH FLEET',
        diff: parseFloat(dedicatedVsPlusDiff.toFixed(1)),
        subMetrics: {
          kurirPlusAvg: parseFloat(kurirPlusAvg.toFixed(1)),
          dedicatedAvg: parseFloat(dedicatedAvg.toFixed(1)),
          kurirPlusCount: kurirPlus2WH.length,
          dedicatedCount: dedicated2WH.length,
          formula: '(2W Plus ÷ 2w Dedicated) × 100'
        }
      },
      dailyActive: {
        value: parseFloat(dailyActiveRate.toFixed(1)),
        unit: '%',
        label: 'DAILY ACTIVE',
        badge: 'DELIV >0',
        filters: '2W | D(0)+PLUS | DELIV >0',
        subMetrics: {
          activeShifts: activeShiftsFiltered,
          totalCouriers: totalUniqueCouriers,
          operatingDays: operatingDays,
          avgCouriersPerDay: parseFloat(avgCouriersPerDay.toFixed(1)),
          formula: 'Active Shifts ÷ (Unique Headcount × Op Days)'
        }
      }
    };
  }

  /**
   * Helper: Parse numeric value from cell
   * @param {string|number} value - Cell value
   * @returns {number} - Parsed number or 0
   */
  parseNumeric(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  /**
   * Helper: Parse percentage value from cell
   * @param {string|number} value - Cell value (e.g., "96.5%" or 96.5)
   * @returns {number} - Parsed percentage as number (96.5)
   */
  parsePercentage(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace('%', '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  // Mock data methods for fallback
  getMockKPIData() {
    return {
      weeklyProductivity: {
        value: 100.7,
        target: 100,
        unit: 'Delivered/Courier/Shift',
        trend: 'up',
        subMetrics: { weekly: '52,761', comparison: 'D1W vs D1W-d7day' }
      },
      unloadedVsPlan: {
        value: 71.6,
        unit: '%',
        label: 'Avg Unloaded Output',
        subMetrics: { packages: '219.8 packages' }
      },
      dailyActive: {
        value: 85.5,
        unit: '%',
        label: 'Weekly Attendance Rate',
        subMetrics: { avgCouriers: 'Avg D1-2 / 31 couriers / day' }
      }
    };
  }

  getMockPerformanceData() {
    return [
      { contractType: 'Dedicated', couriers: 94, delivered: 24220, total: 25012, successRate: 96.8, failed: 579 },
      { contractType: 'Mitra', couriers: 43, delivered: 5366, total: 5631, successRate: 95.3, failed: 196 },
      { contractType: 'Kurir Plus', couriers: 42, delivered: 10185, total: 10691, successRate: 95.3, failed: 380 },
    ];
  }

  getMockZonesData() {
    return [
      { zone: 'OKO-A-03', delivered: 3347, total: 3544, successRate: 94 },
      { zone: 'OKO-B-04', delivered: 2955, total: 3026, successRate: 98 },
      { zone: 'OKO-A-B7', delivered: 2806, total: 2965, successRate: 95 },
      { zone: 'OKO-A-08', delivered: 2867, total: 2930, successRate: 98 },
      { zone: 'OKO-B-B7', delivered: 2786, total: 2891, successRate: 96 },
      { zone: 'OKO-B-B1', delivered: 2760, total: 2856, successRate: 97 },
    ];
  }

  getMockFleetData() {
    return {
      metQuotaPercentage: 28,
      metQuotaCount: 22,
      totalCouriers: 79,
      count2WH: 66,
      count4WH: 13,
      avgTargetPerCourier: 541,
      totalPackages: 39771,
    };
  }

  getMockCourierData() {
    return [
      {
        id: 'SADIOWO001',
        name: 'SADIOWO',
        zone: 'SRENGSENG',
        contract: 'Dedicated',
        vehicle: 'JMA',
        productivityActual: 119.5,
        productivityTarget: 100,
        avgDelivery: 239.5,
        avgTarget: 200,
        totalWeekDelivery: 1,
        successRate: 96.9,
        activeDays: { mon: true, tue: true, wed: false, thu: true, fri: false, sat: true, sun: false }
      }
    ];
  }
}

// Export singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
