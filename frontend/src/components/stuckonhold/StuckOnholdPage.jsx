import { useState } from 'react';
import {
  Package, AlertTriangle, Clock
} from 'lucide-react';

const StuckOnholdPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Stuck Onhold</h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Monitor paket yang stuck dengan status onhold</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border-2 border-dashed border-yellow-300 dark:border-yellow-800 p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
            Stuck Onhold Tracker
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-4 max-w-md mx-auto">
            Halaman ini akan menampilkan data paket yang stuck dengan status onhold.
            Feature sedang dalam tahap development.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm font-medium">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">0</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Total Stuck</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">0</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Critical</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700 dark:text-slate-300">0</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Avg Days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StuckOnholdPage;
