import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import * as XLSX from 'xlsx'
import useAuthStore from '../../../store/authStore'
import AdminLayout from "../../../components/layout/AdminLayout";

export default function AdminLaporanPenindakan() {
  const navigate = useNavigate()
  const token    = useAuthStore((s) => s.token)

  const [laporan, setLaporan]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [total, setTotal]                 = useState(0)

  // Filter state
  const [search, setSearch]         = useState('')
  const [idKategori, setIdKategori] = useState('')
  const [idWilayah, setIdWilayah]   = useState('')
  const [idPetugas, setIdPetugas]   = useState('')
  const [rentang, setRentang]       = useState('semua')

  // Dropdown data
  const [kategoriList, setKategoriList] = useState([])
  const [wilayahList, setWilayahList]   = useState([])
  const [petugasList, setPetugasList]   = useState([])

  // Statistik bawah
  const [stats, setStats] = useState({
    total_derek: 0,
    estimasi_pnbp: 0,
    petugas_aktif: 0,
  })

  // ============================================================
  // Fetch dropdown data sekali saja
  // ============================================================
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [resKategori, resWilayah, resPetugas] = await Promise.all([
          axios.get('http://localhost:3000/api/kategori'),
          axios.get('http://localhost:3000/api/admin/wilayah',
            { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3000/api/admin/petugas',
            { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setKategoriList(resKategori.data?.data || [])
        setWilayahList(resWilayah.data?.data || [])
        // petugas ada di dalam payload.data
        const petugasPayload = resPetugas.data?.data || {}
        setPetugasList(Array.isArray(petugasPayload.data) ? petugasPayload.data : [])
      } catch (err) {
        console.error('Gagal memuat dropdown:', err)
      }
    }
    fetchDropdowns()
  }, [token])

  // ============================================================
  // Fetch laporan penindakan dengan filter
  // ============================================================
  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        setLoading(true)

        // Hitung tanggal berdasarkan rentang
        let tanggal_dari = ''
        const now = new Date()
        if (rentang === 'hari_ini') {
          tanggal_dari = now.toISOString().split('T')[0]
        } else if (rentang === 'minggu_ini') {
          const tujuhHariLalu = new Date(now)
          tujuhHariLalu.setDate(now.getDate() - 7)
          tanggal_dari = tujuhHariLalu.toISOString().split('T')[0]
        } else if (rentang === 'bulan_ini') {
          tanggal_dari = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        }

        const params = new URLSearchParams()
        // Tampilkan yang sudah ditindak atau selesai
        // Kita fetch semua lalu filter, atau bisa juga tidak filter status
        // agar admin bisa lihat semua
        if (search)      params.append('search',      search)
        if (idKategori)  params.append('id_kategori', idKategori)
        if (tanggal_dari) params.append('tanggal_dari', tanggal_dari)
        params.append('limit', '100')

        const res = await axios.get(
          `http://localhost:3000/api/admin/laporan?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        // ✅ Fix parsing: res.data.data = { data: [...], total, page }
        const payload    = res.data?.data || {}
        const allData    = Array.isArray(payload.data) ? payload.data : []

        // Filter status ditindak/selesai di client
        // dan filter petugas jika dipilih
        const filtered = allData.filter((item) => {
          const statusOk   = ['ditindak', 'selesai', 'tidak_ditemukan'].includes(item.status_laporan)
          const petugasOk  = idPetugas
            ? item.petugas?.id_user === parseInt(idPetugas)
            : true
          return statusOk && petugasOk
        })

        setLaporan(filtered)
        setTotal(filtered.length)

        // Hitung statistik
        const derekCount = filtered.filter(
          (l) => l.tindakan?.[0]?.jenis_tindakan === 'derek'
        ).length
        setStats({
          total_derek:    derekCount,
          estimasi_pnbp:  derekCount * 250000,
          petugas_aktif:  [...new Set(filtered.map(l => l.petugas?.id_user).filter(Boolean))].length,
        })

      } catch (err) {
        console.error('Gagal memuat laporan:', err)
        setLaporan([])
      } finally {
        setLoading(false)
      }
    }

    fetchLaporan()
  }, [token, search, idKategori, idWilayah, idPetugas, rentang])

  // ============================================================
  // Export Excel
  // ============================================================
  const exportToExcel = () => {
    const rows = laporan.map((item) => ({
      'Report ID':    item.kode_laporan,
      'Tanggal':      new Date(item.created_at).toLocaleString('id-ID'),
      'Petugas':      item.petugas?.nama || '-',
      'Plat Nomor':   item.nomor_plat,
      'Pelanggaran':  item.kategori?.nama_kategori || '-',
      'Tindakan':     item.tindakan?.[0]?.jenis_tindakan || '-',
      'Status':       item.status_laporan,
      'Lokasi':       item.alamat,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penindakan')
    XLSX.writeFile(wb, `Laporan_Penindakan_${new Date().toLocaleDateString('id-ID')}.xlsx`)
    setShowExportModal(false)
  }

  const handleExportPDF = () => {
    const dataToExport = laporan.map((item) => ({
      id:       item.kode_laporan,
      waktu:    new Date(item.created_at).toLocaleString('id-ID'),
      nopol:    item.nomor_plat,
      kategori: item.kategori?.nama_kategori || '-',
      tindakan: item.tindakan?.[0]?.jenis_tindakan?.toUpperCase() || '-',
      petugas:  item.petugas?.nama || '-',
      status:   item.status_laporan,
    }))
    localStorage.setItem('data_ekspor_dishub', JSON.stringify(dataToExport))
    window.open('/internal/admin/preview-laporan', '_blank')
    setShowExportModal(false)
  }

  const TINDAKAN_STYLE = {
    derek:           'bg-red-100 text-red-700',
    gembok:          'bg-orange-100 text-orange-700',
    teguran:         'bg-gray-100 text-gray-600',
    pindah:          'bg-blue-100 text-blue-700',
    tidak_ditemukan: 'bg-purple-100 text-purple-700',
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">⏳ Memuat data laporan...</p>
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
      {/* MODAL EKSPOR */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">📥</div>
            <h2 className="font-bold text-xl mb-2">Export Data</h2>
            <p className="text-sm text-gray-500 mb-6">
              {total} laporan siap diekspor
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={exportToExcel}
                className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
              >
                📊 Download Excel (.xlsx)
              </button>

              <button
                onClick={handleExportPDF}
                className="bg-blue-950 text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition"
              >
                📄 Preview & Cetak PDF
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* HEADER PAGE */}
        <div className="flex justify-between items-start">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#001A57] flex items-center justify-center shadow-md">
                <span className="text-white text-2xl font-bold">LP</span>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Monitoring Operasional
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                  Laporan Penindakan
                </h1>
                <p className="text-gray-500 mt-2 max-w-4xl leading-relaxed">
                  Monitoring dan pengelolaan data tindakan petugas lapangan terhadap
                  laporan pelanggaran parkir yang telah diverifikasi dan ditindaklanjuti.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="bg-blue-950 hover:bg-blue-900 text-white px-5 py-3 rounded-xl font-bold text-sm"
          >
            📤 Ekspor Data
          </button>
        </div>

        {/* FILTER */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

          {/* Cari */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Cari Laporan
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="No. Plat atau ID"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Rentang Waktu */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Rentang Waktu
            </label>
            <select
              value={rentang}
              onChange={(e) => setRentang(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Waktu</option>
              <option value="hari_ini">Harian (Hari Ini)</option>
              <option value="minggu_ini">Minggu Ini</option>
              <option value="bulan_ini">Bulan Ini</option>
            </select>
          </div>

          {/* Jenis Pelanggaran */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Jenis Pelanggaran
            </label>
            <select
              value={idKategori}
              onChange={(e) => setIdKategori(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Pelanggaran</option>
              {kategoriList.map((k) => (
                <option key={k.id_kategori} value={k.id_kategori}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          {/* Wilayah */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Wilayah Kota
            </label>
            <select
              value={idWilayah}
              onChange={(e) => setIdWilayah(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seluruh Wilayah</option>
              {wilayahList.map((w) => (
                <option key={w.id_wilayah} value={w.id_wilayah}>
                  {w.nama_wilayah}
                </option>
              ))}
            </select>
          </div>

          {/* Petugas */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Petugas
            </label>
            <select
              value={idPetugas}
              onChange={(e) => setIdPetugas(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Petugas</option>
              {petugasList.map((p) => (
                <option key={p.id_user} value={p.id_user}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4 text-left">Report ID</th>
                <th className="px-6 py-4 text-left">Tanggal</th>
                <th className="px-6 py-4 text-left">Petugas</th>
                <th className="px-6 py-4 text-left">Plat Nomor</th>
                <th className="px-6 py-4 text-left">Pelanggaran</th>
                <th className="px-6 py-4 text-left">Tindakan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {laporan.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-medium text-gray-500">
                      Belum ada laporan yang ditindak
                    </p>
                    <p className="text-xs mt-1">
                      Laporan akan muncul setelah petugas menyelesaikan penugasan
                    </p>
                  </td>
                </tr>
              ) : (
                laporan.map((item) => (
                  <tr key={item.id_laporan} className="hover:bg-gray-50 transition">

                    {/* Report ID */}
                    <td className="px-6 py-4 font-bold text-blue-900">
                      #{item.kode_laporan}
                    </td>

                    {/* Tanggal */}
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                      <br />
                      <span className="text-gray-400">
                        {new Date(item.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>

                    {/* Petugas */}
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.petugas?.nama || (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {/* Plat Nomor */}
                    <td className="px-6 py-4">
                      <span className="bg-gray-900 text-white px-2 py-1 rounded text-[11px] font-bold font-mono">
                        {item.nomor_plat}
                      </span>
                    </td>

                    {/* Pelanggaran */}
                    <td className="px-6 py-4 text-gray-600">
                      {item.kategori?.nama_kategori || '-'}
                    </td>

                    {/* Tindakan */}
                    <td className="px-6 py-4">
                      {item.tindakan?.[0]?.jenis_tindakan ? (
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${
                          TINDAKAN_STYLE[item.tindakan[0].jenis_tindakan] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.tindakan[0].jenis_tindakan.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/internal/admin/laporan/${item.id_laporan}`)}
                        className="text-xl hover:opacity-70 transition"
                        title="Lihat Detail"
                      >
                        👁️
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* FOOTER TABLE */}
          {laporan.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
              Menampilkan {laporan.length} laporan
            </div>
          )}
        </div>

        {/* STATISTIK BAWAH */}
        {laporan.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBawah
              icon="🚗"
              label="Total Derek Bulan Ini"
              value={`${stats.total_derek} Kendaraan`}
            />
            <StatBawah
              icon="💰"
              label="Estimasi PNBP"
              value={`Rp ${stats.estimasi_pnbp.toLocaleString('id-ID')}`}
            />
            <StatBawah
              icon="👮"
              label="Petugas Aktif"
              value={`${stats.petugas_aktif} Personel`}
            />
          </div>
        )}

      </div>
    </div>
  )
}

// ============================================================
// KOMPONEN PENDUKUNG
// ============================================================

function StatBawah({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

