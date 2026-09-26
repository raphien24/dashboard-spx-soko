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
        const url = `${BASE_URL}/sheets/range/${encodeURIComponent(range)}`;
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
        const url = `${BASE_URL}/sheets/batch`;
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
   * Parse KPI data from dashboard sheet
   * Using raw sheet data - calculate from courier performance
   */
  async getKPIMetrics() {
    try {
      // Get courier data from raw sheet
      const data = await this.getRange('raw!A2:Z1000'); // Skip header row
      
      if (!data || data.length === 0) {
        return this.getMockKPIData();
      }

      // Calculate KPIs from raw data
      const totalCouriers = data.length;
      const totalDelivered = data.reduce((sum, row) => sum + (this.parseNumeric(row[13]) || 0), 0); // Delivered column
      const totalAssigned = data.reduce((sum, row) => sum + (this.parseNumeric(row[8]) || 0), 0); // Assigned column
      
      // Weekly Avg Productivity: Delivered / Courier / Shift
      const weeklyProductivity = totalCouriers > 0 ? totalDelivered / totalCouriers : 0;
      
      // Unloaded vs Plan: Average delivery progress
      const avgDeliveryProgress = data.reduce((sum, row) => {
        const progress = row[11] ? parseFloat(row[11].replace('%', '')) : 0; // Delivery Progress column
        return sum + progress;
      }, 0) / totalCouriers;
      
      // Daily Active: Calculate attendance rate from data
      const activeToday = data.filter(row => row[13] && this.parseNumeric(row[13]) > 0).length; // Has deliveries
      const attendanceRate = totalCouriers > 0 ? (activeToday / totalCouriers) * 100 : 0;

      return {
        weeklyProductivity: {
          value: parseFloat(weeklyProductivity.toFixed(1)),
          target: 100,
          unit: 'Delivered/Courier/Shift',
          trend: 'up',
          subMetrics: {
            weekly: totalDelivered.toString(),
            comparison: `${totalCouriers} couriers active`
          }
        },
        unloadedVsPlan: {
          value: parseFloat(avgDeliveryProgress.toFixed(1)),
          unit: '%',
          label: 'Avg Delivery Progress',
          subMetrics: {
            packages: `${totalAssigned} assigned`
          }
        },
        dailyActive: {
          value: parseFloat(attendanceRate.toFixed(1)),
          unit: '%',
          label: 'Active Couriers Today',
          subMetrics: {
            avgCouriers: `${activeToday} / ${totalCouriers} couriers active`
          }
        }
      };
    } catch (error) {
      console.error('Error parsing KPI metrics:', error);
      return this.getMockKPIData();
    }
  }

  /**
   * Parse summary metrics from raw data
   */
  async getSummaryMetrics() {
    try {
      const data = await this.getRange('raw!A2:Z1000');
      
      if (!data || data.length === 0) {
        return this.getMockSummaryData();
      }

      // Extract unique values
      const uniqueZones = new Set(data.map(row => row[7]).filter(Boolean)); // Zone ID
      const uniqueDistricts = new Set(data.map(row => row[0]).filter(Boolean)); // District
      const uniqueContracts = new Set(data.map(row => row[5]).filter(Boolean)); // Contract Type
      
      return {
        uniqueWarehouses: uniqueDistricts.size,
        totalEmployees: data.length,
        bdLogistic: uniqueContracts.size,
        totalAccounts: data.reduce((sum, row) => sum + (this.parseNumeric(row[13]) || 0), 0), // Total delivered
        relationships: uniqueZones.size,
      };
    } catch (error) {
      console.error('Error parsing summary metrics:', error);
      return this.getMockSummaryData();
    }
  }

  getMockSummaryData() {
    return {
      uniqueWarehouses: 79,
      totalEmployees: 32741,
      bdLogistic: 22,
      totalAccounts: 34049,
      relationships: 900,
    };
  }

  /**
   * Get performance by contract type data
   */
  async getPerformanceByContract() {
    try {
      const data = await this.getRange('raw!A2:Z1000');
      
      if (!data || data.length === 0) {
        return this.getMockPerformanceData();
      }

      // Group by contract type (column index 5)
      const contractGroups = {};
      data.forEach(row => {
        const contract = row[5] || 'Unknown'; // Contract Type
        if (!contractGroups[contract]) {
          contractGroups[contract] = {
            couriers: 0,
            totalDelivered: 0,
            totalAssigned: 0
          };
        }
        contractGroups[contract].couriers++;
        contractGroups[contract].totalDelivered += this.parseNumeric(row[13]) || 0; // Delivered
        contractGroups[contract].totalAssigned += this.parseNumeric(row[8]) || 0; // Assigned
      });

      // Convert to array format
      return Object.keys(contractGroups).map(contractType => {
        const group = contractGroups[contractType];
        const performance = group.totalAssigned > 0 
          ? (group.totalDelivered / group.totalAssigned) * 100 
          : 0;
        
        return {
          contractType,
          couriers: group.couriers,
          accounts: group.totalDelivered,
          performance: parseFloat(performance.toFixed(1))
        };
      }).filter(item => item.couriers > 0);
    } catch (error) {
      console.error('Error parsing performance data:', error);
      return this.getMockPerformanceData();
    }
  }

  /**
   * Get top zones by parcel volume
   */
  async getTopZones() {
    try {
      const data = await this.getRange('raw!A2:Z1000');
      
      if (!data || data.length === 0) {
        return this.getMockZonesData();
      }

      // Group by zone (column index 7)
      const zoneGroups = {};
      data.forEach(row => {
        const zone = row[7] || 'Unknown'; // Zone ID
        const delivered = this.parseNumeric(row[13]) || 0; // Delivered
        
        if (!zoneGroups[zone]) {
          zoneGroups[zone] = 0;
        }
        zoneGroups[zone] += delivered;
      });

      // Convert to array and sort by parcels
      const zonesArray = Object.keys(zoneGroups).map(zone => ({
        zone,
        parcels: zoneGroups[zone]
      })).sort((a, b) => b.parcels - a.parcels);

      // Calculate percentages and get top 5
      const totalParcels = zonesArray.reduce((sum, z) => sum + z.parcels, 0);
      
      return zonesArray.slice(0, 5).map(z => ({
        zone: z.zone,
        parcels: z.parcels,
        percentage: totalParcels > 0 ? (z.parcels / totalParcels) * 100 : 0
      }));
    } catch (error) {
      console.error('Error parsing zones data:', error);
      return this.getMockZonesData();
    }
  }

  /**
   * Get fleet composition data
   */
  async getFleetComposition() {
    try {
      const data = await this.getRange('raw!A2:Z1000');
      
      if (!data || data.length === 0) {
        return this.getMockFleetData();
      }

      // Group by vehicle type (column index 6)
      const vehicleGroups = {};
      data.forEach(row => {
        const vehicle = row[6] || 'Unknown'; // Vehicle Type
        vehicleGroups[vehicle] = (vehicleGroups[vehicle] || 0) + 1;
      });

      // Map vehicle types to fleet categories
      const motorcycles = (vehicleGroups['2WH'] || 0) + (vehicleGroups['Motor'] || 0);
      const fleetMotors = vehicleGroups['Fleet Motor'] || 0;
      const fleetPickups = vehicleGroups['4WH'] || vehicleGroups['Pickup'] || 0;
      const totalFleet = motorcycles + fleetMotors + fleetPickups;

      // Calculate average deliveries
      const totalDelivered = data.reduce((sum, row) => sum + (this.parseNumeric(row[13]) || 0), 0);
      const avgPerCourier = data.length > 0 ? totalDelivered / data.length : 0;

      return {
        mainTarget: 80, // You can adjust this
        motorcycles,
        fleetMotors,
        fleetPickups,
        avgTargetPerCourier: parseFloat(avgPerCourier.toFixed(1)),
        totalPackages: totalDelivered,
      };
    } catch (error) {
      console.error('Error parsing fleet data:', error);
      return this.getMockFleetData();
    }
  }

  /**
   * Get courier schedule data with filters
   */
  async getCourierSchedule(filters = {}) {
    try {
      const data = await this.getRange('raw!A2:Z1000');
      
      if (!data || data.length === 0) {
        return this.getMockCourierData();
      }

      // Map raw data to courier format
      let couriers = data.map(row => {
        const delivered = this.parseNumeric(row[13]) || 0;
        const assigned = this.parseNumeric(row[8]) || 0;
        const target = this.parseNumeric(row[9]) || 100;
        const deliveredPct = row[14] ? parseFloat(row[14].replace('%', '')) : 0;
        
        return {
          id: row[1] || '', // ID
          name: row[2] || '', // Name
          zone: row[7] || '', // Zone ID
          contract: row[5] || '', // Contract Type
          vehicle: row[6] || '', // Vehicle Type
          productivityActual: assigned > 0 ? (delivered / assigned) * 100 : 0,
          productivityTarget: target,
          avgDelivery: delivered,
          avgTarget: assigned,
          totalWeekDelivery: delivered,
          successRate: deliveredPct,
          activeDays: {
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: false,
            sun: false,
          }
        };
      }).filter(c => c.name);

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

      return couriers;
    } catch (error) {
      console.error('Error parsing courier schedule:', error);
      return this.getMockCourierData();
    }
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
      { contractType: 'Dedicated', couriers: 2163, accounts: 89, performance: 89.9 },
      { contractType: 'Kiloan', couriers: 341, accounts: 18, performance: 89.0 },
      { contractType: 'Group-based', couriers: 127, accounts: 7, performance: 73.0 },
      { contractType: 'Kora Plus', couriers: 341, accounts: 18, performance: 89.0 },
    ];
  }

  getMockZonesData() {
    return [
      { zone: 'JKT-20 (Date)', parcels: 38250341, percentage: 50 },
      { zone: 'JKT-21 (Date)', parcels: 18115942, percentage: 28 },
      { zone: 'JKT-22 (Date)', parcels: 12314281, percentage: 19 },
      { zone: 'JKT P-30 (Date)', parcels: 9575641, percentage: 15 },
      { zone: 'JKT P-33 (Date)', parcels: 3322453, percentage: 8 },
    ];
  }

  getMockFleetData() {
    return {
      mainTarget: 28,
      motorcycles: 66,
      fleetMotors: 13,
      fleetPickups: 0,
      avgTargetPerCourier: 0,
      totalPackages: 490,
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
