import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cekStatusLaporan } from '../../api/public.api'
import { getRiwayat } from '../../utils/riwayat'
import { STATUS_LABEL, STATUS_COLOR, formatTanggal } from '../../utils/formatters'

export default function Dashboard() {
  const navigate = useNavigate()
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const kodes = getRiwayat()

      if (!kodes || !kodes.length) {
        setLoading(false)
        return
      }

      try {
        const responses = await Promise.all(
          kodes.map(kode => cekStatusLaporan(kode))
        )

        const dataLaporan = responses
          .map(res => res.data?.data)
          .filter(Boolean)

        setLaporan(dataLaporan)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  const menunggu = laporan.filter(
    l => l.status_laporan === 'menunggu_verifikasi'
  ).length

  const ditindak = laporan.filter(
    l => ['dalam_penanganan', 'ditindak'].includes(l.status_laporan)
  ).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="font-bold text-gray-800">SiapParkir</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="hidden md:flex w-52 bg-blue-950 flex-col py-6 px-4">

          <div className="flex items-center gap-3 bg-blue-900 rounded-xl px-3 py-3 mb-6">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white">
              👤
            </div>

            <div className="flex flex-col">
              <span className="text-white text-xs font-bold">
                Masyarakat
              </span>
            </div>
          </div>

          <div className="space-y-1 flex-1">

            <button
              onClick={() => navigate('/lapor')}
              className="w-full flex items-center gap-2 bg-blue-700 text-white rounded-lg px-3 py-2.5 text-sm font-medium mb-4"
            >
              + Laporan Baru
            </button>

            <SidebarItem
              icon="📊"
              label="Dashboard"
              onClick={() => navigate('/dashboard')}
              active
            />

            <SidebarItem
              icon="📋"
              label="Laporan Masuk"
              onClick={() => navigate('/lapor')}
            />

            <SidebarItem
              icon="🗂️"
              label="Riwayat Laporan"
              onClick={() => navigate('/riwayat')}
            />
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-blue-300 text-sm py-2"
          >
            ← Keluar
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">

          <div className="max-w-5xl mx-auto space-y-8">

            {/* BANNER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-8 relative overflow-hidden text-white flex flex-col justify-between shadow-sm min-h-[220px]">

                <div className="absolute right-6 bottom-[-20px] text-[180px] font-black text-white opacity-5 select-none pointer-events-none leading-none">
                  P
                </div>

                <div className="max-w-md space-y-2 z-10">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Pantau & Lapor Parkir Liar
                  </h1>

                  <p className="text-blue-200 text-sm leading-relaxed">
                    Bantu wujudkan ketertiban kota. Laporkan kendaraan
                    yang parkir sembarangan dan pantau status tindak lanjut
                    secara real-time.
                  </p>
                </div>

                <div className="pt-4 z-10">
                  <button
                    onClick={() => navigate('/lapor')}
                    className="bg-cyan-100 hover:bg-cyan-200 text-blue-950 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
                  >
                    📸 Buat Laporan Baru
                  </button>
                </div>
              </div>

              {/* CARD */}
              <div className="flex flex-col gap-4 justify-between">

                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Menunggu Verifikasi
                    </p>

                    <p className="text-3xl font-bold text-gray-800">
                      {menunggu}
                    </p>
                  </div>

                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl">
                    📋
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Sedang Ditindak
                    </p>

                    <p className="text-3xl font-bold text-gray-800">
                      {ditindak}
                    </p>
                  </div>

                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                    🛡️
                  </div>
                </div>

              </div>
            </div>

            {/* RIWAYAT */}
            <div className="space-y-4">

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Riwayat Laporan
                </h2>

                <button
                  onClick={() => navigate('/riwayat')}
                  className="text-sm font-semibold text-blue-700"
                >
                  Lihat Semua →
                </button>
              </div>

              {loading && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  ⏳ Memuat riwayat data...
                </div>
              )}

              {!loading && laporan.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="text-5xl mb-3">📭</div>

                  <p className="font-semibold text-gray-600">
                    Belum ada laporan
                  </p>

                  <button
                    onClick={() => navigate('/lapor')}
                    className="mt-5 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold"
                  >
                    Buat Laporan Pertama
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {/* LOGIKA: Sortir berdasarkan waktu, lalu ambil 3 pertama */}
                {!loading && [...laporan]
                  .sort((a, b) => new Date(b.waktu_laporan) - new Date(a.waktu_laporan))
                  .slice(0, 3)
                  .map((l) => (
                  <button
                    key={l.kode_laporan}
                    onClick={() => navigate(`/detail/${l.kode_laporan}`)}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                        🚗
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {l.kategori?.nama_kategori || 'Pelanggaran Parkir'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          📍 {l.alamat}
                        </p>
                        <p className="text-xs text-gray-400">
                          📅 {formatTanggal(l.waktu_laporan)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        STATUS_COLOR[l.status_laporan] ||
                        'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      {STATUS_LABEL[l.status_laporan] || l.status_laporan}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
        active
          ? 'bg-blue-800 text-white'
          : 'text-blue-300 hover:bg-blue-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}