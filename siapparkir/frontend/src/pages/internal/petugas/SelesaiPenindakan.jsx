import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, ClipboardList, LayoutDashboard, Users, LogOut } from 'lucide-react'

export default function SelesaiPenindakan() {
  const navigate    = useNavigate()
  const { state }   = useLocation()
  const hasil       = state?.hasil || null

  // Kalau tidak ada data hasil, redirect ke dashboard
  if (!hasil) {
    navigate('/internal/petugas')
    return null
  }

  const LABEL_TINDAKAN = {
    teguran:         'Teguran (Warning)',
    gembok:          'Gembok Ban',
    derek:           'Derek Kendaraan',
    pindah:          'Pemindahan Kendaraan',
    tidak_ditemukan: 'Kendaraan Tidak Ditemukan',
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#001A57] rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">SiapParkir</h1>
            <p className="text-xs text-gray-400 mt-0.5">Penugasan Selesai</p>
          </div>
        </div>
        <img
          src="/avatar-petugas.jpg"
          alt="Petugas"
          className="w-10 h-10 rounded-full border border-gray-200 object-cover"
        />
      </header>

      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="hidden md:flex w-64 bg-[#001A57] text-white flex-col justify-between p-6 shadow-xl">
          <nav className="space-y-1.5 mt-4">
            <SidebarItem
              icon={<LayoutDashboard size={16}/>}
              label="Dashboard"
              onClick={() => navigate('/internal/petugas')}
            />
            <SidebarItem
              icon={<ClipboardList size={16}/>}
              label="Laporan Masuk"
              onClick={() => navigate('/internal/petugas/laporan')}
            />
            <SidebarItem
              icon={<Users size={16}/>}
              label="Petugas Lapangan"
              onClick={() => navigate('/internal/petugas/tugas')}
            />
          </nav>
          <button
            onClick={() => navigate('/internal/login')}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-300 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut size={16} /> Keluar
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto flex items-start justify-center">
          <div className="w-full max-w-3xl">

            {/* ICON SUKSES */}
            <div className="text-center mb-10">
              <div className="relative inline-block">
                <div className="w-28 h-28 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto">
                  <CheckCircle className="text-[#001A57]" size={56} />
                </div>
                <div className="absolute -top-2 -right-2 w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-black">✓</span>
                </div>
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 mt-6 mb-2">
                Penugasan Selesai
              </h1>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Laporan tindakan telah berhasil diunggah dan tercatat dalam sistem Dishub Pusat.
              </p>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* DETAIL TINDAKAN */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-800">Detail Tindakan</h2>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
                    ✓ Verified
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <span className="text-xs text-gray-400 font-medium">ID Laporan</span>
                    <span className="text-sm font-bold text-gray-800">
                      #{hasil.kode_laporan || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <span className="text-xs text-gray-400 font-medium">Kategori Tindakan</span>
                    <span className="text-sm font-bold text-gray-800 text-right max-w-[160px]">
                      {LABEL_TINDAKAN[hasil.jenis_tindakan] || hasil.jenis_tindakan || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                    <span className="text-xs text-gray-400 font-medium">Plat Nomor</span>
                    <span className="text-sm font-bold font-mono text-gray-800">
                      {hasil.nomor_plat || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-400 font-medium">Lokasi Kejadian</span>
                    <span className="text-sm text-gray-700 text-right max-w-[180px] leading-relaxed">
                      {hasil.alamat || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BUKTI TINDAKAN */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">Bukti Tindakan</h2>
                  <span className="text-lg">🖼️</span>
                </div>

                {hasil.foto_tindakan ? (
                  <div className="relative">
                    <img
                      src={`http://localhost:3000/uploads/${hasil.foto_tindakan}`}
                      alt="Bukti tindakan"
                      className="w-full h-52 object-cover rounded-xl"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md">
                      Captured: {new Date().toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })} WIB
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-52 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                    Tidak ada foto
                  </div>
                )}
              </div>
            </div>

            {/* TOMBOL AKSI */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/internal/petugas')}
                className="flex items-center gap-2 bg-[#001A57] hover:bg-[#00133f] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition shadow-sm"
              >
                <ClipboardList size={16} />
                Kembali ke Daftar Tugas
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
        active
          ? 'bg-[#BCE3FF] text-[#001A57]'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon} {label}
    </button>
  )
}