import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft, MapPin, Camera, Truck,
  Megaphone, Lock, Move, CheckCircle,
  LogOut, LayoutDashboard, ClipboardList, History
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'
import Swal from 'sweetalert2';

const TINDAKAN_LABEL = {
  teguran:         'Teguran (Warning)',
  gembok:          'Gembok Ban',
  derek:           'Derek Kendaraan',
  pindah:          'Pemindahan Kendaraan',
  tidak_ditemukan: 'Kendaraan Tidak Ditemukan',
}

const TINDAKAN_STYLE = {
  teguran:         'bg-gray-100 text-gray-700',
  gembok:          'bg-orange-100 text-orange-700',
  derek:           'bg-red-100 text-red-700',
  pindah:          'bg-blue-100 text-blue-700',
  tidak_ditemukan: 'bg-purple-100 text-purple-700',
}

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DetailPenindakan() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const token    = useAuthStore((s) => s.token)

  const [penugasan, setPenugasan]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')

  // Form tindakan (hanya untuk tugas aktif)
  const [tindakan, setTindakan]       = useState('teguran')
  const [catatan, setCatatan]         = useState('')
  const [fotoBukti, setFotoBukti]     = useState(null)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [sudahMulai, setSudahMulai]   = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          `http://localhost:3000/api/petugas/tugas/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = res.data?.data
        setPenugasan(data)
        if (data?.Laporan?.status_laporan === 'dalam_penanganan') {
          setSudahMulai(true)
        }
      } catch (err) {
        console.error('Gagal memuat detail:', err)
        setError('Gagal memuat data tugas')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id, token])

  const handleMulai = async () => {
    const result = await Swal.fire({
      title: 'Mulai Penanganan?',
      text: "Status akan berubah menjadi 'Dalam Penanganan'.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#001A57',
      confirmButtonText: 'Ya, Mulai'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:3000/api/petugas/tugas/${id}/mulai`, {}, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setSudahMulai(true);
        Swal.fire('Berhasil!', 'Penanganan telah dimulai.', 'success');
      } catch {
        Swal.fire('Gagal', 'Gagal memulai penanganan.', 'error');
      }
    }
  };

  const handleSelesaikan = async () => {
    if (!fotoBukti) {
      return Swal.fire({ icon: 'warning', title: 'Foto Wajib Diunggah', text: 'Mohon lampirkan foto bukti tindakan.' });
    }

    const result = await Swal.fire({
      title: 'Selesaikan Tugas?',
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Ya, Selesai'
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('jenis_tindakan', tindakan);
        formData.append('catatan_tindakan', catatan);
        formData.append('foto_tindakan', fotoBukti);

        const res = await axios.post(`http://localhost:3000/api/petugas/tugas/${id}/selesai`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        
        navigate('/internal/petugas/selesai', { state: { hasil: res.data?.data } });
      } catch (err) {
        Swal.fire('Error', err.response?.data?.message || 'Gagal menyelesaikan tugas', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFotoBukti(file)
      setPreviewFoto(URL.createObjectURL(file))
    }
  }

  // --- LOADING STATE ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-900 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">Menyiapkan detail tugas...</p>
    </div>
  );

  // --- ERROR STATE ---
  if (error || !penugasan) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center max-w-sm w-full">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Oops! Ada Masalah</h2>
        <p className="text-gray-500 text-sm mb-6">
          {error || 'Data penugasan tidak ditemukan di sistem.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="w-full px-5 py-3 bg-[#001A57] text-white rounded-2xl font-semibold hover:bg-blue-900 transition-all active:scale-95"
        >
          Kembali ke Sebelumnya
        </button>
      </div>
    </div>
  );

  const lap      = penugasan.Laporan || {}
  const tindakanData = lap.tindakan?.[0] || null
  const sudahSelesai = penugasan.status_penugasan === 'selesai'

  return (
    <div className="max-w-8xl mx-auto">
      {/* Tombol Back */}
      <button
        onClick={() => navigate(-1)}
        className="px-5 py-2 bg-[#001A57] text-white rounded-xl text-sm hover:bg-[#00133f] transition-all mb-8"
      >
        ← Kembali
      </button>

      {/* Konten Halaman (Layout Header/Sidebar sudah dihapus) */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">#{lap.kode_laporan || '-'}</h2>
        {sudahSelesai ? (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">✓ Penindakan Selesai</span>
        ) : (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-red-600">Membutuhkan Penindakan</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KOLOM KIRI — Info Laporan */}
            <div className="space-y-5">

              {/* Info Pelanggaran */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                  Informasi Pelanggaran
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">
                      Nomor Kendaraan
                    </p>
                    <p className="text-3xl font-black font-mono text-gray-900 mt-1">
                      {lap.nomor_plat || '-'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase">
                        Jenis Pelanggaran
                      </p>
                      <p className="text-sm font-bold text-gray-700 mt-1">
                        {lap.kategori?.nama_kategori || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase">
                        Jenis Kendaraan
                      </p>
                      <p className="text-sm font-bold text-gray-700 mt-1">
                        {lap.jenis_kendaraan || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{lap.alamat || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Foto Bukti Pelapor */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                  Bukti Foto Pelapor
                </h3>
                {lap.foto_bukti ? (
                  <div className="w-full h-[500px] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner">
                    <img
                      src={`http://localhost:3000/uploads/${lap.foto_bukti}`}
                      alt="Bukti pelapor"
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[500px] bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                    <span>Tidak ada foto bukti</span>
                  </div>
                )}
              </div>

              {/* Log Status */}
              {lap.log && lap.log.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                    Riwayat Status
                  </h3>
                  <div className="space-y-3">
                    {[...lap.log].reverse().map((log, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-[#001A57] mt-1.5 flex-shrink-0" />
                          {i < lap.log.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-bold text-gray-700 capitalize">
                            {log.status_baru?.replace(/_/g, ' ')}
                          </p>
                          {log.catatan && (
                            <p className="text-xs text-gray-400 mt-0.5">{log.catatan}</p>
                          )}
                          <p className="text-[10px] text-gray-300 mt-0.5">
                            {formatTanggal(log.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-5">

              {/* ============================================
                  MODE SELESAI — Tampilkan hasil tindakan
              ============================================ */}
              {sudahSelesai && tindakanData && (
                <>
                  {/* Hasil Tindakan */}
                  <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-xs font-bold text-gray-400 uppercase">
                        Hasil Tindakan
                      </h3>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        ✓ Terverifikasi
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                          Jenis Tindakan
                        </p>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                          TINDAKAN_STYLE[tindakanData.jenis_tindakan] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {TINDAKAN_LABEL[tindakanData.jenis_tindakan] || tindakanData.jenis_tindakan}
                        </span>
                      </div>

                      {tindakanData.catatan_tindakan && (
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                            Catatan Petugas
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">
                            {tindakanData.catatan_tindakan}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 font-bold uppercase mb-1">
                            Waktu Mulai
                          </p>
                          <p className="text-gray-700 font-medium">
                            {formatTanggal(tindakanData.waktu_mulai)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase mb-1">
                            Waktu Selesai
                          </p>
                          <p className="text-gray-700 font-medium">
                            {formatTanggal(tindakanData.waktu_selesai)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Foto Tindakan */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                      Foto Bukti Tindakan
                    </h3>
                    {tindakanData.foto_tindakan ? (
                      <div className="relative">
                        <img
                          src={`http://localhost:3000/uploads/${tindakanData.foto_tindakan}`}
                          alt="Bukti tindakan"
                          className="w-full h-56 object-cover rounded-xl"
                        />
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md">
                          📍 {formatTanggal(tindakanData.waktu_selesai)}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                        Tidak ada foto tindakan
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ============================================
                  MODE AKTIF — Form tindakan
              ============================================ */}
              {!sudahSelesai && (
                <>
                  {/* Pilih Tindakan */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                      Tindakan Lapangan
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'teguran',         icon: <Megaphone size={20}/>, label: 'Teguran' },
                        { id: 'gembok',          icon: <Lock size={20}/>,      label: 'Gembok' },
                        { id: 'derek',           icon: <Truck size={20}/>,     label: 'Derek' },
                        { id: 'pindah',          icon: <Move size={20}/>,      label: 'Pindah' },
                        { id: 'tidak_ditemukan', icon: <span className="text-xl">🔍</span>, label: 'Tidak Ditemukan' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setTindakan(opt.id)}
                          className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 text-xs font-bold transition-all
                            ${tindakan === opt.id
                              ? 'border-[#001A57] bg-[#001A57]/5 text-[#001A57]'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'}
                            ${opt.id === 'tidak_ditemukan' ? 'col-span-2' : ''}
                          `}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Foto */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                      Bukti Tindakan
                    </h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                      id="inputFotoTindakan"
                    />
                    {previewFoto ? (
                      <div className="relative w-full h-[400px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                        <img
                          src={previewFoto}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => { setFotoBukti(null); setPreviewFoto(null); }}
                          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition-all"
                        >
                          Ganti Foto
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="inputFotoTindakan"
                        className="border-2 border-dashed border-gray-300 rounded-2xl h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all"
                      >
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                          <Camera className="text-blue-500" size={32} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Ambil atau Unggah Foto Hasil</span>
                        <span className="text-xs text-gray-400 mt-1">Klik untuk memilih file</span>
                      </label>
                    )}
                  </div>

                  {/* Catatan */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                      Catatan Petugas
                    </h3>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Masukkan keterangan tambahan..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#001A57] resize-none"
                    />
                  </div>

                  {/* Tombol */}
                  <div className="space-y-3">
                    {!sudahMulai && (
                      <button
                        onClick={handleMulai}
                        className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition"
                      >
                        🚔 Mulai Penanganan
                      </button>
                    )}
                    {sudahMulai && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-700 font-medium text-center">
                        🚔 Sedang Dalam Penanganan
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSelesaikan}
                        disabled={submitting || !sudahMulai}
                        className="flex-1 py-3.5 bg-[#001A57] hover:bg-[#00133f] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        {submitting ? 'Menyimpan...' : 'Selesaikan Penugasan'}
                      </button>
                    </div>
                    {!sudahMulai && (
                      <p className="text-xs text-center text-gray-400">
                        Tekan "Mulai Penanganan" terlebih dahulu
                      </p>
                    )}
                  </div>
                </>
              )}
        </div>
      </div>
    </div>
  )}