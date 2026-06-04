import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../../../store/authStore'

export default function PenilaianMasyarakat() {
  const navigate = useNavigate()
  const token    = useAuthStore((s) => s.token)

  const [previewUrl, setPreviewUrl] = useState('/avatar-admin.jpg')
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
        // Fetch Profil
        const profilRes = await axios.get('http://localhost:3000/api/admin/profil', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (profilRes.data?.data?.foto_profil) {
          setPreviewUrl(`http://localhost:3000/uploads/${profilRes.data.data.foto_profil}`)
        }
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
    <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 rounded-3xl p-8 shadow-sm mb-8">
        <div className="absolute right-0 top-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative">
          <span className="text-blue-200 text-xs uppercase tracking-[0.25em] font-bold">
            Sistem SiapParkir
          </span>

          <h1 className="text-4xl font-extrabold text-white mt-2">
            Penilaian Masyarakat
          </h1>

          <p className="text-blue-100 mt-3 max-w-2xl text-sm leading-relaxed">
            Pantau feedback, rating, dan komentar masyarakat terhadap proses
            penanganan laporan parkir liar secara real-time.
          </p>
        </div>
      </div>

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
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm font-bold tracking-wide">
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
    </div>
  )
}

// ============================================================
// KOMPONEN PENDUKUNG
// ============================================================

function StatCard({ title, value, valueColor = 'text-gray-900' }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-gray-400 font-medium">
        {title}
      </p>

      <p className={`text-3xl font-extrabold mt-2 tracking-tight ${valueColor}`}>
        {value}
      </p>
    </div>
  )
}