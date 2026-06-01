import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cekStatusLaporan } from '../../api/public.api'
import { getRiwayat } from '../../utils/riwayat'
import { STATUS_LABEL, STATUS_COLOR, formatTanggal } from '../../utils/formatters'

export default function RiwayatPage() {
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
        // Kita buat fetch yang tidak akan merusak Promise.all jika satu gagal
        const results = await Promise.allSettled(kodes.map(kode => cekStatusLaporan(kode)))
        
        const dataLaporan = results
          .filter(res => res.status === 'fulfilled' && res.value.data?.data)
          .map(res => res.value.data.data)
        
        setLaporan(dataLaporan)
      } catch (error) {
        console.error("Gagal memuat:", error)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const menunggu = laporan.filter(l => l.status_laporan === 'menunggu_verifikasi').length
  const ditindak = laporan.filter(l => ['dalam_penanganan','ditindak'].includes(l.status_laporan)).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="font-bold text-gray-800">SiapParkir</span>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-75 bg-blue-950 flex-col py-6 px-4">

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
              active
            />
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-red-500 text-sm py-2 font-medium transition-all duration-300 hover:text-red-200 hover:translate-x-1 cursor-pointer"          >
            ← Keluar
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 bg-gray-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Riwayat Laporan</h2>
              <p className="text-sm text-gray-500">Pantau status perkembangan laporan parkir Anda.</p>
            </div>

            {/* Stat Cards - Tengahnya persis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'TOTAL', count: laporan.length, color: 'text-gray-900' },
                { label: 'MENUNGGU', count: menunggu, color: 'text-orange-500' },
                { label: 'DITANGANI', count: ditindak, color: 'text-blue-600' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 tracking-wider">{s.label}</p>
                  <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.count}</p>
                </div>
              ))}
            </div>

            {/* List Laporan */}
            <div className="space-y-4">
              {!loading && laporan.map(l => (
                <button
                  key={l.kode_laporan}
                  onClick={() => navigate(`/detail/${l.kode_laporan}`)}
                  className="w-full bg-white rounded-2xl p-4 md:p-5 flex items-start gap-4 hover:shadow-md transition border border-gray-200 text-left"
                >
                  {/* Box Foto */}
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                    {l.foto_bukti && (
                      <img
                        src={`http://localhost:3000/uploads/${l.foto_bukti}`}
                        onError={(e) => {
                          console.log("GAGAL LOAD:", e.target.src)
                        }}
                        alt="Bukti Laporan"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-800 text-base">{l.kategori?.nama_kategori || l.nomor_plat}</p>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <span>📍</span>
                        <span className="truncate">{l.alamat}</span>
                        <span className="mx-1">•</span>
                        <span>📅 {formatTanggal(l.waktu_laporan)}</span>
                      </div>
                    </div>

                    {/* Badge Status */}
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 flex-shrink-0 self-start md:self-center">
                      {STATUS_LABEL[l.status_laporan] || l.status_laporan}
                    </span>
                  </div>
                </button>
              ))}
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
        ${active ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-900 hover:text-white'}`}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  )
}