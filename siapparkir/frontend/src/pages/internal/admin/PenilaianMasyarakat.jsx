import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../../../store/authStore'

export default function PenilaianMasyarakat() {
  const navigate = useNavigate()
  const token    = useAuthStore((s) => s.token)

  const [dataPenilaian, setDataPenilaian] = useState([])
  const [loading, setLoading]             = useState(true)
  const [statistik, setStatistik]         = useState({
    laporan_aktif:    0,
    kasus_verifikasi: 0,
    umpan_balik:      0,
    rata_rata_rating: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await axios.get('http://localhost:3000/api/admin/penilaian', {
          headers: { Authorization: `Bearer ${token}` },
        })

        // ✅ Backend return: res.data.data = { statistik, data: [...], total }
        const payload = res.data?.data || {}
        const data    = Array.isArray(payload.data) ? payload.data : []

        setDataPenilaian(data)
        setStatistik({
          laporan_aktif:    payload.statistik?.laporan_aktif    || 0,
          kasus_verifikasi: payload.statistik?.kasus_verifikasi || 0,
          umpan_balik:      payload.statistik?.umpan_balik      || 0,
          rata_rata_rating: payload.statistik?.rata_rata_rating || 0,
        })
      } catch (err) {
        console.error('Gagal mengambil data penilaian:', err)
        setDataPenilaian([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const renderBintang = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-200'}>
        ★
      </span>
    ))
  }

  const formatTanggal = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <LayoutAdmin>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Penilaian Masyarakat
      </h2>

      {loading ? (
        <div className="bg-white p-10 rounded-2xl border text-center text-gray-400">
          ⏳ Memuat data penilaian...
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="LAPORAN AKTIF"
              value={statistik.laporan_aktif}
              icon="📊"
            />
            <StatCard
              title="KASUS TERVERIFIKASI"
              value={statistik.kasus_verifikasi}
              icon="✅"
            />
            <StatCard
              title="UMPAN BALIK"
              value={statistik.umpan_balik}
              icon="💬"
            />
            <StatCard
              title="RATA-RATA RATING"
              value={`${statistik.rata_rata_rating} ★`}
              icon="⭐"
              valueColor="text-yellow-500"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Daftar Penilaian</h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Respon komunitas terbaru dan tingkat kepuasan.
                </p>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                Total: {dataPenilaian.length} penilaian
              </span>
            </div>

            {dataPenilaian.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">⭐</div>
                <p className="font-medium text-gray-500">Belum ada penilaian masuk</p>
                <p className="text-xs mt-1">
                  Penilaian akan muncul setelah masyarakat memberikan rating
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4 text-left">Kode Laporan</th>
                    <th className="px-6 py-4 text-left">Penilaian</th>
                    <th className="px-6 py-4 text-left">Komentar</th>
                    <th className="px-6 py-4 text-left">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataPenilaian.map((item) => (
                    <tr
                      key={item.id_penilaian}
                      className="hover:bg-gray-50 transition"
                    >
                      {/* Kode Laporan */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-blue-900">
                            {item.Laporan?.kode_laporan || '-'}
                          </span>
                          {item.Laporan?.alamat && (
                            <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                              📍 {item.Laporan.alamat}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Rating bintang */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-base">
                            {renderBintang(item.rating)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1 font-bold">
                            ({item.rating}/5)
                          </span>
                        </div>
                      </td>

                      {/* Komentar */}
                      <td className="px-6 py-4 max-w-xs">
                        {item.komentar ? (
                          <p className="text-gray-600 italic text-xs leading-relaxed">
                            "{item.komentar}"
                          </p>
                        ) : (
                          <span className="text-gray-300 text-xs">
                            Tidak ada komentar
                          </span>
                        )}
                      </td>

                      {/* Waktu */}
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {formatTanggal(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </LayoutAdmin>
  )
}

// ============================================================
// KOMPONEN PENDUKUNG
// ============================================================

function StatCard({ title, value, icon, valueColor = 'text-gray-900' }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="text-xs font-bold text-gray-400 mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-black ${valueColor}`}>{value}</div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

function LayoutAdmin({ children }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">Admin Dishub</h1>
            <p className="text-xs text-gray-400 mt-0.5">Sistem Verifikasi Laporan</p>
          </div>
        </div>
        <button onClick={() => navigate('/internal/admin/profil')}>
          <img
            src="/path-to-admin-photo.jpg"
            alt="Admin"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
        </button>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-blue-950 flex-col">
          <div
            onClick={() => navigate('/internal/admin/profil')}
            className="px-5 py-5 border-b border-blue-900 cursor-pointer hover:bg-blue-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white text-lg">
                🛡️
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">Administrator</h2>
                <p className="text-blue-300 text-xs">Dishub Kota</p>
              </div>
            </div>
          </div>
          <div className="space-y-1 flex-1 p-4">
            <SidebarItem icon="📊" label="Dashboard"
              onClick={() => navigate('/internal/admin')} />
            <SidebarItem icon="📋" label="Laporan Masuk"
              onClick={() => navigate('/internal/admin/laporan')} />
            <SidebarItem icon="📈" label="Penilaian Masyarakat"
              onClick={() => navigate('/internal/admin/penilaian')} active />
            <SidebarItem icon="⚙️" label="Manajemen Petugas"
              onClick={() => navigate('/internal/admin/petugas')} />
          </div>
          <div className="p-4 border-t border-blue-900">
            <button
              onClick={() => navigate('/')}
              className="w-full text-blue-300 hover:text-white text-sm py-2 transition"
            >
              ← Keluar
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-blue-800 text-white'
          : 'text-blue-300 hover:bg-blue-900 hover:text-white'
      }`}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  )
}