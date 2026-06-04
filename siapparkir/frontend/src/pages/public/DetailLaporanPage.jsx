import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cekStatusLaporan, kirimPenilaian } from '../../api/public.api'
import { STATUS_LABEL, STATUS_COLOR, formatTanggal } from '../../utils/formatters'
import { MapPinned } from 'lucide-react'
import Swal from 'sweetalert2';

export default function DetailLaporanPage() {
  const { kode } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [ulasan, setUlasan] = useState('')

  const handleKirimPenilaian = async () => {
    if (rating === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Mohon berikan rating (bintang) terlebih dahulu!',
        confirmButtonColor: '#1d4ed8'
      });
    }

    try {
      setLoading(true);
      
      // Tampilkan loading modal saat mengirim
      Swal.fire({
        title: 'Mengirim...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await kirimPenilaian({
        kode_laporan: kode,
        rating: rating,
        komentar: ulasan
      });

      await Swal.fire({
        icon: 'success',
        title: 'Terima Kasih!',
        text: 'Penilaian Anda sangat berharga bagi kami.',
        timer: 2000,
        showConfirmButton: false
      });

      navigate('/riwayat'); 
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat mengirim penilaian. Silakan coba lagi.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cekStatusLaporan(kode)
      .then((r) => {
        setData(r.data.data)
      })
      .catch((err) => {
        console.log("ERROR:", err)
      })
      .finally(() => setLoading(false))
  }, [kode])

  // 1. Loading State yang lebih modern (menggunakan animasi spin)
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-medium animate-pulse">Memuat detail laporan...</p>
      </div>
    )
  }

  // 2. Error/Empty State yang lebih "clean" (gaya empty state modern)
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 max-w-sm w-full">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-black text-gray-800">Laporan Tidak Ditemukan</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Mohon maaf, kode laporan yang Anda cari tidak tersedia atau sudah dihapus.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="mt-6 w-full px-5 py-3 bg-blue-900 text-white rounded-2xl font-bold hover:bg-blue-800 transition-all active:scale-95"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1550px] mx-auto">
      <div className="space-y-6">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-gray-250 rounded-xl shadow-sm text-[#001A57] font-semibold transition-all duration-200 hover:bg-[#001A57] hover:text-white hover:border-[#001A57] hover:shadow-lg"
        >
          ← Kembali
        </button>

        {/* HEADER DETAIL */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#001A57] to-[#0037C1] rounded-3xl p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-20 translate-x-20" />
          <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-white/5 translate-y-12" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-[0.2em] font-semibold">
                Detail Laporan
              </p>
              <h1 className="text-3xl font-bold mt-2">
                #{data.kode_laporan}
              </h1>
              <p className="text-blue-100 text-sm mt-3">
                Dilaporkan pada {formatTanggal(data.waktu_laporan)}
              </p>
            </div>

            <div>
              <span
                className={`px-10 py-3 rounded-2xl text-xl font-bold border bg-white text-[#001A57] shadow-lg`}
              >
                {STATUS_LABEL[data.status_laporan]}
              </span>
            </div>

          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MapPinned size={20} className="text-[#001A57]" />
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Lokasi Pelanggaran
                  </h3>
                  <p className="text-xs text-gray-500">
                    Detail lokasi kejadian yang dilaporkan
                  </p>
                </div>

              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Alamat Lengkap
                </p>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {data.alamat}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">🖼️ Bukti Foto</h3>
              {data.foto_bukti ? (
                <img src={`http://localhost:3000/uploads/${data.foto_bukti}`} alt="Bukti Laporan" />
              ) : (
                <div className="h-52 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">Tidak ada foto</div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6">Status Penanganan</h3>
              <Timeline status={data.status_laporan} logs={data.log} />
              {data.tindakan && data.tindakan.length > 0 && data.tindakan[0].foto_tindakan && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-bold text-gray-800 mb-4">📸 Bukti Penindakan Petugas</h4>
                  <img src={`http://localhost:3000/uploads/${data.tindakan[0].foto_tindakan}`} alt="Bukti Penindakan" className="w-64 h-40 object-cover rounded-2xl border shadow-sm" />
                  <div className="mt-4 bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm"><span className="font-semibold">Jenis Tindakan:</span> {data.tindakan[0].jenis_tindakan}</p>
                    {data.tindakan[0].catatan_tindakan && (<p className="text-sm mt-2"><span className="font-semibold">Catatan Petugas:</span> {data.tindakan[0].catatan_tindakan}</p>)}
                    {data.tindakan[0].waktu_selesai && (<p className="text-sm mt-2"><span className="font-semibold">Waktu Selesai:</span> {formatTanggal(data.tindakan[0].waktu_selesai)}</p>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-800 mb-2">Penilaian Layanan</h3>
            <p className="text-xs text-gray-400 mb-4">Bantu meningkatkan layanan dengan memberikan penilaian.</p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => setRating(i)} className={`text-2xl transition ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
              ))}
            </div>
            <textarea value={ulasan} onChange={(e) => setUlasan(e.target.value)} placeholder="Tulis pengalaman Anda..." className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={5} />
            <button onClick={handleKirimPenilaian} disabled={loading} className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50">
              {loading ? 'Mengirim...' : 'Kirim Penilaian'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Timeline({ status, logs = [] }) {
  const steps = [{ key: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' }, { key: 'dalam_penanganan', label: 'Dalam Penanganan' }, { key: 'ditindak', label: 'Selesai Ditindak' }];
  const currentIndex = steps.findIndex(s => s.key === status);
  const getWaktuForStep = (stepKey) => {
    const logItem = logs.find(l => {
      const statusValue = l.status_baru || l.status || '';
      return statusValue.toString().toLowerCase().replace(/ /g, '_') === stepKey;
    });
    return logItem ? logItem.created_at : null;
  };

  return (
    <div className="space-y-5">
      {steps.map((step, i) => {
        const active = i <= currentIndex;
        const waktu = getWaktuForStep(step.key);
        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${active ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {active ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${active ? 'bg-blue-700' : 'bg-gray-200'}`} />}
            </div>
            <div className="pt-1">
              <p className={`font-semibold text-sm ${active ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
              {waktu && <p className="text-xs text-blue-600 font-medium mt-0.5">{formatTanggal(waktu)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}