import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Search, Filter } from 'lucide-react'
import useAuthStore from '../../../store/authStore'

export default function LaporanMasuk() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)

  const [laporan, setLaporan] = useState([])
  const [filteredLaporan, setFilteredLaporan] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_antrian: 0,
    belum_verifikasi: 0,
    indikasi_duplikat: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          'http://localhost:3000/api/petugas/laporan-masuk',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const payload = res.data?.data || {}
        const dataArray = Array.isArray(payload.data) ? payload.data : []

        setLaporan(dataArray)
        setFilteredLaporan(dataArray)
        setStats({
          total_antrian: payload.statistik?.total_antrian || 0,
          belum_verifikasi: payload.statistik?.belum_verifikasi || 0,
          indikasi_duplikat: payload.statistik?.indikasi_duplikat || 0,
        })
      } catch (err) {
        console.error('Gagal mengambil data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredLaporan(laporan)
      return
    }
    const keyword = search.toLowerCase()
    setFilteredLaporan(
      laporan.filter((item) =>
        item.kode_laporan?.toLowerCase().includes(keyword) ||
        item.nomor_plat?.toLowerCase().includes(keyword) ||
        item.alamat?.toLowerCase().includes(keyword)
      )
    )
  }, [search, laporan])

  const formatWaktu = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const STATUS_STYLE = {
    menunggu_verifikasi: 'bg-yellow-50 text-yellow-600',
    diverifikasi: 'bg-blue-50 text-blue-600',
    ditolak: 'bg-red-50 text-red-600',
  }

  const STATUS_LABEL = {
    menunggu_verifikasi: 'Pending',
    diverifikasi: 'Verifikasi',
    ditolak: 'Ditolak',
  }

  return (
    <div className="space-y-8">
      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Antrian Laporan Masuk</h1>
        <p className="text-gray-500 text-sm">Verifikasi dan tugaskan petugas untuk laporan pelanggaran terbaru.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard label="TOTAL ANTRIAN" value={stats.total_antrian} icon="📋" />
        <StatCard label="BELUM DIVERIFIKASI" value={stats.belum_verifikasi} icon="🔴" valueColor="text-red-600" />
        <StatCard label="INDIKASI DUPLIKAT" value={stats.indikasi_duplikat} icon="📄" />
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <Search className="text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID Laporan, Nopol, atau Lokasi..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID Laporan</th>
                  <th className="px-6 py-4">Foto Bukti</th>
                  <th className="px-6 py-4">Waktu Laporan</th>
                  <th className="px-6 py-4">Lokasi</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-gray-400">
                      ⏳ Memuat data laporan...
                    </td>
                  </tr>
                ) : filteredLaporan.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-gray-400">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="font-medium text-gray-500">Tidak ada laporan masuk</p>
                    </td>
                  </tr>
                ) : (
                  filteredLaporan.map((item) => (
                    <tr
                      key={item.id_laporan}
                      onClick={() => navigate(`/internal/petugas/tugas/${item.id_laporan}`)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {/* ID Laporan */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#001A57] text-sm">
                          #{item.kode_laporan}
                        </span>
                        {item.is_duplikat ? (
                          <span className="ml-2 text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-bold">
                            DUPLIKAT
                          </span>
                        ) : null}
                      </td>

                      {/* Foto */}
                      <td className="px-6 py-4">
                        {item.foto_bukti ? (
                          <img
                            src={`http://localhost:3000/uploads/${item.foto_bukti}`}
                            alt="Bukti"
                            className="w-16 h-10 object-cover rounded-lg border border-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">
                            N/A
                          </div>
                        )}
                      </td>

                      {/* Waktu */}
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {formatWaktu(item.waktu_laporan)}
                      </td>

                      {/* Lokasi */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="font-medium text-gray-700 text-sm truncate">
                          {item.alamat || '-'}
                        </p>
                        {item.kategori?.nama_kategori && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.kategori.nama_kategori}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          STATUS_STYLE[item.status_laporan] || 'bg-gray-50 text-gray-500'
                        }`}>
                          ● {STATUS_LABEL[item.status_laporan] || item.status_laporan}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, valueColor = 'text-gray-900' }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-gray-400 tracking-wider">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${valueColor}`}>{value}</p>
    </div>
  )
}