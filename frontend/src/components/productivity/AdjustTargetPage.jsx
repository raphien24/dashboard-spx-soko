import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Plus, Trash2, Save, AlertTriangle, CheckCircle, Calendar, Target as TargetIcon } from 'lucide-react';
import { getTargetAppeals, submitTargetAppeal, deleteTargetAppeal } from '../../services/googleSheetsService';

const AdjustTargetPage = () => {
  const [appeals, setAppeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [weekStart, setWeekStart] = useState('');
  const [contract, setContract] = useState('Dedicated');
  const [vehicle, setVehicle] = useState('2WH');
  const [appealTarget, setAppealTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const fetchAppeals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTargetAppeals();
      setAppeals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAppeals(); }, []);

  // Generate week options (last 12 weeks + next 4 weeks)
  const weekOptions = useMemo(() => {
    const weeks = [];
    const today = new Date();
    // Find last Monday
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - diff);

    for (let i = -12; i <= 4; i++) {
      const monday = new Date(lastMonday);
      monday.setDate(lastMonday.getDate() + (i * 7));
      const yyyy = monday.getFullYear();
      const mm = String(monday.getMonth() + 1).padStart(2, '0');
      const dd = String(monday.getDate()).padStart(2, '0');
      const formatted = `${yyyy}-${mm}-${dd}`;
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const label = `Week ${formatted} - ${sunday.getDate()}/${sunday.getMonth() + 1}`;
      weeks.push({ value: formatted, label });
    }
    return weeks.reverse(); // newest first
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weekStart || !appealTarget) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await submitTargetAppeal(weekStart, contract, vehicle, parseFloat(appealTarget), 'Web User');
      setSubmitStatus({ type: 'success', message: 'Target appeal saved successfully!' });
      setAppealTarget('');
      await fetchAppeals();
    } catch (err) {
      setSubmitStatus({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const handleDelete = async (appeal) => {
    if (!confirm(`Delete appeal for ${appeal.Contract} ${appeal.Vehicle} week ${appeal['Week Start']}?`)) return;

    try {
      await deleteTargetAppeal(appeal['Week Start'], appeal.Contract, appeal.Vehicle);
      await fetchAppeals();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Sort appeals by week desc
  const sortedAppeals = useMemo(() => {
    return [...appeals].sort((a, b) => {
      const dateA = new Date(a['Week Start']);
      const dateB = new Date(b['Week Start']);
      return dateB - dateA; // newest first
    });
  }, [appeals]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Target Appeals...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900 mb-1">Error loading appeals</p>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button onClick={fetchAppeals} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Adjust Weekly Target</h2>
          <p className="text-sm text-gray-500 mt-1">Submit approved appeal targets to override original Monday targets</p>
        </div>
        <button onClick={fetchAppeals} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Submit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Submit Appeal Target</h3>
            <p className="text-xs text-gray-500">Enter approved target after appeal process</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week (Monday)</label>
              <select value={weekStart} onChange={e => setWeekStart(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Week...</option>
                {weekOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>

            {/* Contract */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract</label>
              <select value={contract} onChange={e => setContract(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="Dedicated">Dedicated</option>
                <option value="Kurir Plus">Kurir Plus</option>
              </select>
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <select value={vehicle} onChange={e => setVehicle(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="2WH">2WH</option>
                <option value="4WH">4WH</option>
              </select>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appeal Target</label>
              <input type="number" step="0.01" value={appealTarget} onChange={e => setAppealTarget(e.target.value)} required
                placeholder="e.g., 85.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {submitStatus && (
                <div className={`flex items-center gap-2 text-sm ${
                  submitStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {submitStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{submitStatus.message}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium">
              {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? 'Saving...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </div>

      {/* Appeals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TargetIcon className="w-5 h-5 text-indigo-600" />
            Active Target Appeals
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-semibold">{sortedAppeals.length}</span>
          </h3>
        </div>

        {sortedAppeals.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No target appeals yet. Submit one above to override default targets.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Week Start</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Contract</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Appeal Target</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Last Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Updated By</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedAppeals.map((appeal, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-mono text-xs">{appeal['Week Start']}</td>
                    <td className="px-4 py-3 text-gray-700">{appeal.Contract}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        appeal.Vehicle === '2WH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>{appeal.Vehicle}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold text-indigo-700">{appeal['Appeal Target']}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{appeal['Last Updated']}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{appeal['Updated By']}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(appeal)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded text-xs">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Note:</strong> Appeal targets will automatically replace original Monday targets in KPI calculations.
          Use the toggle in the dashboard to compare with original targets.
        </p>
      </div>
    </div>
  );
};

export default AdjustTargetPage;
