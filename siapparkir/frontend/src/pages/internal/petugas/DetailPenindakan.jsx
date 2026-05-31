import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft, MapPin, Camera, Truck,
  Megaphone, Lock, Move, CheckCircle, LogOut,
  LayoutDashboard, ClipboardList, Users
} from 'lucide-react'
import useAuthStore from '../../../store/authStore'

export default function DetailPenindakan() {
  const navigate    = useNavigate()
  const { id }      = useParams() // id_penugasan
  const token       = useAuthStore((s) => s.token)

  const [penugasan, setPenugasan]     = useState(null)
  const [loading, setLoading]         = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [tindakan, setTindakan]       = useState('teguran')
  const [catatan, setCatatan]         = useState('')
  const [fotoBukti, setFotoBukti]     = useState(null)
  const [previewFoto, setPreviewFoto] = useState(null)
  const [sudahMulai, setSudahMulai]   = useState(false)
  const [error, setError]             = useState('')

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
        // Cek apakah sudah dalam penanganan
        if (data?.Laporan?.status_laporan === 'dalam_penanganan') {
          setSudahMulai(true)
        }
      } catch (err) {
        console.error('Gagal memuat detail tugas:', err)
        setError('Gagal memuat data tugas')
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id, token])

  const handleMulai = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/petugas/tugas/${id}/mulai`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSudahMulai(true)
    } catch (err) {
      console.error('Gagal memulai penanganan:', err)
      alert('Gagal memulai penanganan')
    }
  }

  const handleFotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFotoBukti(file)
      setPreviewFoto(URL.createObjectURL(file))
    }
  }

  const handleSelesaikan = async () => {
    if (!fotoBukti) return alert('Harap unggah foto bukti tindakan!')

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('jenis_tindakan',   tindakan)
      formData.append('catatan_tindakan', catatan)
      formData.append('foto_tindakan',    fotoBukti)

      const res = await axios.post(
        `http://localhost:3000/api/petugas/tugas/${id}/selesai`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      // Navigasi ke halaman sukses dengan data hasil tindakan
      navigate('/internal/petugas/selesai', {
        state: { hasil: res.data?.data }
      })
    } catch (err) {
      console.error('Gagal menyelesaikan tugas:', err)
      alert(err.response?.data?.message || 'Gagal menyelesaikan tugas')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <p className="text-gray-400 text-sm">⏳ Memuat detail tugas...</p>
    </div>
  )

  if (error || !penugasan) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <p className="text-gray-600 font-semibold mb-4">{error || 'Tugas tidak ditemukan'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-[#001A57] text-white rounded-xl text-sm"
        >
          ← Kembali
        </button>
      </div>
    </div>
  )

  const lap = penugasan.Laporan || {}

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="w-8 h-8 bg-[#001A57] rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">SiapParkir</h1>
            <p className="text-xs text-gray-400 mt-0.5">Detail Penindakan</p>
          </div>
        </div>
        <img
          src="/avatar-petugas.jpg"
          alt="Petugas"
          className="w-10 h-10 rounded-full border border-gray-200 object-cover"
        />
      </header>

      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="hidden md:flex w-64 bg-[#001A57] text-white flex-col justify-between p-6 shadow-xl">
          <nav className="space-y-1.5 mt-4">
            <SidebarItem
              icon={<LayoutDashboard size={16}/>}
              label="Dashboard"
              onClick={() => navigate('/internal/petugas')}
            />
            <SidebarItem
              icon={<ClipboardList size={16}/>}
              label="Laporan Masuk"
              active
              onClick={() => navigate('/internal/petugas/laporan')}
            />
            <SidebarItem
              icon={<Users size={16}/>}
              label="Petugas Lapangan"
              onClick={() => navigate('/internal/petugas/tugas')}
            />
          </nav>
          <button
            onClick={() => navigate('/internal/login')}
            className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-300 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut size={16} /> Keluar
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">

          {/* PAGE HEADER */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">
                #{lap.kode_laporan || '-'}
              </h2>
              <span className="text-xs font-bold px-2 py-1 rounded bg-red-50 text-red-600">
                {penugasan.tindakan_direkomendasikan
                  ? `Rekomendasi: ${penugasan.tindakan_direkomendasikan}`
                  : 'Membutuhkan Penindakan'}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Laporan diterima {lap.waktu_laporan
                ? new Date(lap.waktu_laporan).toLocaleString('id-ID')
                : '-'}
            </p>
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
                  <img
                    src={`http://localhost:3000/uploads/${lap.foto_bukti}`}
                    alt="Bukti pelapor"
                    className="w-full h-52 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-52 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                    Tidak ada foto
                  </div>
                )}
                {lap.latitude && lap.longitude && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    GPS: {parseFloat(lap.latitude).toFixed(6)}, {parseFloat(lap.longitude).toFixed(6)}
                  </p>
                )}
              </div>

              {/* Tombol Mulai (jika belum mulai) */}
              {!sudahMulai && (
                <button
                  onClick={handleMulai}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  🚔 Mulai Penanganan
                </button>
              )}

              {sudahMulai && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 font-medium text-center">
                  🚔 Sedang Dalam Penanganan
                </div>
              )}
            </div>

            {/* KOLOM KANAN — Form Tindakan */}
            <div className="space-y-5">

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
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }
                        ${opt.id === 'tidak_ditemukan' ? 'col-span-2' : ''}
                      `}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Foto Tindakan */}
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
                  <div className="relative">
                    <img
                      src={previewFoto}
                      alt="Preview"
                      className="w-full h-44 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setFotoBukti(null)
                        setPreviewFoto(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="inputFotoTindakan"
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition"
                  >
                    <Camera className="text-gray-400 mb-2" size={28} />
                    <span className="text-xs font-bold text-gray-500">
                      Ambil atau Unggah Foto Hasil
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      JPG, PNG maks 5MB
                    </span>
                  </label>
                )}
              </div>

              {/* Catatan Petugas */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                  Catatan Petugas
                </h3>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Masukkan keterangan tambahan jika diperlukan..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#001A57] resize-none"
                />
              </div>

              {/* Tombol Selesaikan */}
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
                  Tekan "Mulai Penanganan" terlebih dahulu sebelum menyelesaikan tugas
                </p>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
        active
          ? 'bg-[#BCE3FF] text-[#001A57]'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon} {label}
    </button>
  )
}