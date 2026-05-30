import { useLocation, useNavigate } from 'react-router-dom'

export default function SuksesPage() {
  const navigate  = useNavigate()
  const { state } = useLocation()
  const kode      = state?.kode  || '-'
  const alamat    = state?.alamat || '-'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="font-bold text-gray-800">SiapParkir</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm w-full max-w-md p-8 text-center">
          {/* Icon sukses */}
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan Berhasil Terkirim</h1>
          <p className="text-gray-500 text-sm mb-8">
            Terima kasih atas kontribusi Anda dalam menjaga ketertiban lalu lintas kota. Laporan Anda sedang kami proses untuk validasi petugas.
          </p>

          {/* Info laporan */}
          <div className="border border-gray-200 rounded-xl p-5 mb-8 text-left space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">ID Laporan</p>
                <p className="text-xl font-bold text-gray-900">#{kode}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Estimasi Verifikasi</p>
                <p className="text-blue-600 font-semibold text-sm flex items-center gap-1 justify-end">
                  <span>🕐</span> 1x24 Jam
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-start gap-3">
              <span className="text-gray-400 mt-0.5">📍</span>
              <div>
                <p className="text-sm text-gray-700 font-medium line-clamp-2">{alamat}</p>
              </div>
            </div>
          </div>

          {/* Tombol */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
            >
              🏠 Kembali ke Beranda
            </button>
            <button
              onClick={() => navigate('/riwayat')}
              className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
            >
              🗂️ Lihat Riwayat
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs">🏛️</span>
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-gray-500">Dinas Perhubungan</p>
              <p className="text-xs text-gray-400">SISTEM PELAPORAN TERPADU</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}