import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

const SPGenerator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">SP Generator</h2>
          <p className="text-sm text-gray-500 mt-1">Generate Surat Peringatan Documents</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          title="Refresh page"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Loading SP Generator...</p>
          </div>
        </div>
      )}

      {/* Iframe Content */}
      <div className="flex-1 relative">
        <iframe
          key={key}
          src="https://script.google.com/a/macros/spxexpress.com/s/AKfycbzSiytqZtPHx_xs2DV_nKs4k3ic6d-j6CQzDbapm3M/dev"
          className="w-full h-full border-0"
          title="SP Generator"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
};

export default SPGenerator;
