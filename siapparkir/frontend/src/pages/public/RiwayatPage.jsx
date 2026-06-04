import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cekStatusLaporan } from '../../api/public.api'
import { getRiwayat } from '../../utils/riwayat'
import { STATUS_LABEL, STATUS_COLOR, formatTanggal } from '../../utils/formatters'
import { FileText } from 'lucide-react'

export default function RiwayatPage() {
  const navigate = useNavigate()
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true; // Flag untuk mencegah memory leak

    const loadRiwayatLaporan = async () => {
      const kodes = getRiwayat();

      if (!kodes?.length) {
        setLoading(false);
        return;
      }

      try {
        // Menggunakan allSettled adalah pilihan tepat untuk menjaga stabilitas
        const results = await Promise.allSettled(kodes.map(kode => cekStatusLaporan(kode)));

        // Memfilter hasil hanya yang 'fulfilled' dan memiliki data
        const dataValid = results
          .filter(res => res.status === 'fulfilled' && res.value?.data?.data)
          .map(res => res.value.data.data);

        if (isMounted) {
          setLaporan(dataValid);
        }
      } catch (error) {
        // Log error secara rapi
        console.error("Gagal memuat riwayat laporan:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRiwayatLaporan();

    return () => { isMounted = false; }; // Cleanup: mencegah error saat user navigasi cepat
  }, []);

  const menunggu = laporan.filter(l => l.status_laporan === 'menunggu_verifikasi').length
  const ditindak = laporan.filter(l => ['dalam_penanganan','ditindak'].includes(l.status_laporan)).length

  return (
    <div className="w-full max-w-[1550px] mx-auto">
        
        {/* Title */}
        <div className="mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#001A57] flex items-center justify-center shadow-md">
              <FileText size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Riwayat Laporan
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                  Sistem SiapParkir
                </p>
              </div>
              <p className="text-gray-600 w-full text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                Pantau status verifikasi, proses penanganan, hingga hasil penindakan dari setiap laporan yang telah Anda kirimkan.
              </p>
            </div>

          </div>
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
  )
}