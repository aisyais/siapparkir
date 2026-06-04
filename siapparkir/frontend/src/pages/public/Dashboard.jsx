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
    const loadRiwayat = async () => {
      const kodes = getRiwayat();
      
      // Jika tidak ada data, langsung berhenti dengan rapi
      if (!kodes?.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Menggunakan Promise.all untuk mengambil semua data secara paralel
        const responses = await Promise.all(
          kodes.map(kode => cekStatusLaporan(kode).catch(() => null))
        );
        
        // Memfilter hasil yang sukses saja dan memperbarui state
        const dataValid = responses
          .map(res => res?.data?.data)
          .filter(Boolean);
          
        setLaporan(dataValid);
        
      } catch (err) {
        console.error('Gagal memuat riwayat:', err);
        // Anda bisa menambahkan toast error di sini jika perlu
      } finally {
        setLoading(false);
      }
    };

    loadRiwayat();
  }, []); // Dependency array kosong tetap dipertahankan

  const menunggu = laporan.filter(l => l.status_laporan === 'menunggu_verifikasi').length
  const ditindak = laporan.filter(l => ['dalam_penanganan', 'ditindak'].includes(l.status_laporan)).length

  return (
    <div className="w-full max-w-[1550px] mx-auto">
      {/* BANNER & CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl p-8 relative overflow-hidden text-white flex flex-col justify-between shadow-sm min-h-[220px]">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pantau & Lapor Parkir Liar</h1>
          <p className="text-blue-200 text-sm">Bantu wujudkan ketertiban kota. Laporkan kendaraan yang parkir sembarangan dan pantau status tindak lanjut secara real-time.</p>
          <button 
            onClick={() => navigate('/lapor')} 
            className="bg-cyan-100 hover:bg-cyan-300 text-blue-950 px-5 py-2.5 rounded-xl text-sm font-bold w-fit transition shadow-sm"
          >
            📸 Buat Laporan Baru
          </button>
        </div>
        
        <div className="flex flex-col gap-4 justify-between">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Menunggu Verifikasi</p>
              <p className="text-3xl font-bold text-gray-800">{menunggu}</p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl">📋</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Sedang Ditindak</p>
              <p className="text-3xl font-bold text-gray-800">{ditindak}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">🛡️</div>
          </div>
        </div>
      </div>

      {/* RIWAYAT */}
      <div className="space-y-4 mt-10"> {/* Tambahkan mt-10 di sini */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-blue-700 rounded-full"></div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Riwayat Laporan</h2>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">⏳ Memuat riwayat data...</div>
        )}

        {!loading && laporan.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-semibold text-gray-600">Belum ada laporan</p>
            <button onClick={() => navigate('/lapor')} className="mt-5 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold">
              Buat Laporan Pertama
            </button>
          </div>
        )}

        <div className="space-y-3">
          {!loading && [...laporan]
            .sort((a, b) => new Date(b.waktu_laporan) - new Date(a.waktu_laporan))
            .slice(0, 3)
            .map((l) => (
              <button
                key={l.kode_laporan}
                onClick={() => navigate(`/detail/${l.kode_laporan}`)}
                className="group w-full bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  {/* Foto dengan Rounded yang lebih lembut */}
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                    {l.foto_bukti ? (
                      <img src={`http://localhost:3000/uploads/${l.foto_bukti}`} alt="Bukti" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl opacity-50">🚗</div>
                    )}
                  </div>
                  
                  <div className="space-y-0.5">
                    {/* Judul dengan font yang lebih tegas */}
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {l.kategori?.nama_kategori || 'Pelanggaran Parkir'}
                    </h3>
                    
                    {/* Plat Nomor sebagai detail sekunder */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-bold tracking-wide">
                        {l.nomor_plat}
                      </span>
                      <span>•</span>
                      <span className="text-sm text-gray-500 break-words leading-snug">{l.alamat}</span>
                    </div>
                    
                    {/* Tanggal dengan style yang lebih bersih */}
                    <p className="text-sm text-gray-500 break-words leading-snug">
                      📅 {formatTanggal(l.waktu_laporan)}
                    </p>
                  </div>
                </div>

                {/* Badge Status dengan style modern */}
                <div className="flex sm:justify-end">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                    STATUS_COLOR[l.status_laporan] || 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {STATUS_LABEL[l.status_laporan] || l.status_laporan}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}