import { useLocation, useNavigate } from 'react-router-dom'

export default function SuksesPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const kode = state?.kode || '-';
  const alamat = state?.alamat || '-';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 fixed w-full top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="font-bold text-gray-800 tracking-tight">SiapParkir</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 mt-16">
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 w-full max-w-md p-8 text-center border border-gray-100">
          
          {/* Ikon Sukses */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto relative border-4 border-white shadow-sm">
              <span className="text-4xl">🎉</span>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Laporan Terkirim!</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Terima kasih telah berkontribusi. Laporan Anda telah masuk ke sistem verifikasi kami.
          </p>

          {/* Info Card */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-4 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID Laporan</p>
                <p className="text-lg font-mono font-bold text-blue-700">#{kode}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verifikasi</p>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full">1x24 JAM</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lokasi</p>
              <p className="text-sm text-gray-700 font-medium">{alamat}</p>
            </div>
          </div>

          {/* Tombol dengan Hover Elegan */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 bg-blue-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
            >
              Kembali ke Dashboard
            </button>
            <button
              onClick={() => navigate('/riwayat')}
              className="w-full py-3.5 text-gray-600 font-semibold rounded-2xl transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
            >
              Cek Riwayat Laporan
            </button>
          </div>

          {/* Footer Branding Resmi */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-gray-800 uppercase">Dinas Perhubungan</p>
              <p className="text-[9px] text-gray-400 font-medium tracking-wider uppercase">Sistem Pelaporan Terpadu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}