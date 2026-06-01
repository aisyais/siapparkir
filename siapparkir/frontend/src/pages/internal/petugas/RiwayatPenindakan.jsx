import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard, ClipboardList, History,
  LogOut, User
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'

const TINDAKAN_LABEL = {
  teguran:         'Teguran',
  gembok:          'Gembok Ban',
  derek:           'Derek',
  pindah:          'Pindah',
  tidak_ditemukan: 'Tidak Ditemukan',
}

const TINDAKAN_STYLE = {
  teguran:         'bg-gray-100 text-gray-600',
  gembok:          'bg-orange-100 text-orange-700',
  derek:           'bg-red-100 text-red-700',
  pindah:          'bg-blue-100 text-blue-700',
  tidak_ditemukan: 'bg-purple-100 text-purple-700',
}

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function RiwayatPenindakan() {
  const navigate = useNavigate()
  const token    = useAuthStore((s) => s.token)

  const [riwayat, setRiwayat]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState({
    total: 0, teguran: 0, gembok: 0, derek: 0,
  })

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          'http://localhost:3000/api/petugas/tugas?status_penugasan=selesai&limit=100',
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const payload = res.data?.data || {}
        const data    = Array.isArray(payload.data) ? payload.data : []

        setRiwayat(data)

        // Hitung statistik dari data
        const allTindakan = data.map(
          (item) => item.Laporan?.tindakan?.[0]?.jenis_tindakan || ''
        )
        setStats({
          total:   data.length,
          teguran: allTindakan.filter((t) => t === 'teguran').length,
          gembok:  allTindakan.filter((t) => t === 'gembok').length,
          derek:   allTindakan.filter((t) => t === 'derek').length,
        })
      } catch (err) {
        console.error('Gagal memuat riwayat:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRiwayat()
  }, [token])

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
            <p className="text-xs text-gray-400 mt-0.5">Riwayat Penindakan</p>
          </div>
        </div>
        <button onClick={() => navigate('/internal/petugas/profil')}>
          <img
            src="/avatar-petugas.jpg"
            alt="Petugas"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
        </button>
      </header>

      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="hidden md:flex w-64 bg-[#001A57] text-white flex-col justify-between p-6 shadow-xl">
          <div className="space-y-8">
            <button
              onClick={() => navigate('/internal/petugas/profil')}
              className="w-full flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Masuk sebagai</div>
                <div className="text-sm font-bold tracking-wide">Petugas</div>
              </div>
            </button>
            <nav className="space-y-1.5">
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
                icon={<History size={16}/>}
                label="Riwayat Penindakan"
                active
              />
            </nav>
          </div>
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={() => navigate('/internal/login')}
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-red-300 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">

          {/* TITLE */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Riwayat Penindakan
            </h1>
            <p className="text-gray-500 text-sm">
              Semua laporan yang telah berhasil kamu selesaikan.
            </p>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Selesai" value={stats.total}   icon="✅" color="text-gray-900" />
            <StatCard label="Teguran"       value={stats.teguran} icon="📢" color="text-gray-700" />
            <StatCard label="Gembok"        value={stats.gembok}  icon="🔒" color="text-orange-600" />
            <StatCard label="Derek"         value={stats.derek}   icon="🚚" color="text-red-600" />
          </div>

          {/* LIST */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              ⏳ Memuat riwayat...
            </div>
          ) : riwayat.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-semibold text-gray-600">Belum ada riwayat penindakan</p>
              <p className="text-sm text-gray-400 mt-1">
                Selesaikan tugas dari dashboard untuk melihat riwayat
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">ID Laporan</th>
                    <th className="px-6 py-4 text-left">Nomor Plat</th>
                    <th className="px-6 py-4 text-left">Lokasi</th>
                    <th className="px-6 py-4 text-left">Tindakan</th>
                    <th className="px-6 py-4 text-left">Foto Bukti</th>
                    <th className="px-6 py-4 text-left">Waktu Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {riwayat.map((item) => {
                    const lap      = item.Laporan || {}
                    const tindakan = lap.tindakan?.[0] || {}
                    return (
                      <tr
                        key={item.id_penugasan}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => navigate(`/internal/petugas/tugas/${item.id_penugasan}`)}
                      >
                        {/* ID */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#001A57]">
                            #{lap.kode_laporan || '-'}
                          </span>
                        </td>

                        {/* Plat */}
                        <td className="px-6 py-4">
                          <span className="bg-gray-900 text-white px-2 py-1 rounded text-[11px] font-bold font-mono">
                            {lap.nomor_plat || '-'}
                          </span>
                        </td>

                        {/* Lokasi */}
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-gray-700 text-xs truncate">
                            {lap.alamat || '-'}
                          </p>
                          {lap.kategori?.nama_kategori && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              {lap.kategori.nama_kategori}
                            </p>
                          )}
                        </td>

                        {/* Tindakan */}
                        <td className="px-6 py-4">
                          {tindakan.jenis_tindakan ? (
                            <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                              TINDAKAN_STYLE[tindakan.jenis_tindakan] || 'bg-gray-100 text-gray-600'
                            }`}>
                              {TINDAKAN_LABEL[tindakan.jenis_tindakan] || tindakan.jenis_tindakan}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>

                        {/* Foto Bukti Tindakan */}
                        <td className="px-6 py-4">
                          {tindakan.foto_tindakan ? (
                            <img
                              src={`http://localhost:3000/uploads/${tindakan.foto_tindakan}`}
                              alt="Bukti"
                              className="w-14 h-10 object-cover rounded-lg border border-gray-100"
                            />
                          ) : (
                            <div className="w-14 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                              N/A
                            </div>
                          )}
                        </td>

                        {/* Waktu */}
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {formatTanggal(tindakan.waktu_selesai || item.waktu_penugasan)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* FOOTER */}
              <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
                Total {riwayat.length} penindakan selesai
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
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