import { ExternalLink, FileText, AlertCircle, ArrowRight } from 'lucide-react';

const GAS_URL = 'https://script.google.com/a/macros/spxexpress.com/s/AKfycbzSiytqZtPHx_xs2DV_nKs4k3ic6d-j6CQzDbapm3M/dev';

const SPGenerator = () => {
  const handleOpen = () => {
    window.open(GAS_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SP Generator</h2>
              <p className="text-red-100 text-sm">Generate Surat Peringatan Kurir secara otomatis</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
              <FileText className="w-10 h-10 text-red-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Buka SP Generator
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              SP Generator berjalan di Google Apps Script dan membutuhkan login akun{' '}
              <span className="font-medium text-gray-700">@spxexpress.com</span>.
              Klik tombol di bawah untuk membuka di tab baru.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleOpen}
              className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Buka SP Generator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Akan terbuka di tab baru
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-1">Persyaratan Akses</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Login menggunakan akun Google Workspace <span className="font-medium">@spxexpress.com</span></li>
              <li>Pastikan akun sudah mendapat izin akses dari administrator</li>
              <li>Gunakan browser yang sudah login ke akun yang benar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Steps Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
          Cara Penggunaan
        </h4>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Buka SP Generator', desc: 'Klik tombol "Buka SP Generator" di atas untuk membuka aplikasi.' },
            { step: '2', title: 'Pilih Kurir', desc: 'Cari dan pilih kurir yang akan diberikan Surat Peringatan.' },
            { step: '3', title: 'Isi Detail SP', desc: 'Lengkapi informasi pelanggaran, tanggal, dan jenis SP (SP1/SP2/SP3).' },
            { step: '4', title: 'Generate & Simpan', desc: 'Klik Generate untuk membuat dokumen SP yang siap ditandatangani.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                {step}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SPGenerator;
