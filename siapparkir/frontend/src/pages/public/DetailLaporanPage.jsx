import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { cekStatusLaporan } from '../../api/public.api'
import {
  STATUS_LABEL,
  STATUS_COLOR,
  formatTanggal
} from '../../utils/formatters'
import { kirimPenilaian } from '../../api/public.api'

export default function DetailLaporanPage() {
  const { kode } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [ulasan, setUlasan] = useState('')

  const handleKirimPenilaian = async () => {
    if (rating === 0) {
      alert("Mohon berikan rating terlebih dahulu!");
      return;
    }

    try {
      setLoading(true);
      await kirimPenilaian({
        kode_laporan: kode,
        rating: rating,
        komentar: ulasan
      });
      alert("Terima kasih atas penilaian Anda!");
      // Opsional: Redirect ke halaman riwayat atau refresh halaman
      navigate('/riwayat'); 
    } catch (err) {
      console.error("Gagal mengirim penilaian:", err);
      alert("Gagal mengirim penilaian. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    cekStatusLaporan(kode)
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [kode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">
          ⏳ Memuat detail laporan...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-700 font-semibold">
            Data laporan tidak ditemukan
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-5 py-2 bg-blue-700 text-white rounded-xl text-sm"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm z-10">

        <div className="flex items-center gap-2">

          <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">
              P
            </span>
          </div>

          <span className="font-bold text-gray-800">
            SiapParkir
          </span>

        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
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
              onClick={() => navigate('/riwayat')}              
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
            className="text-blue-300 text-sm py-2"
          >
            ← Keluar
          </button>

        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">

          <div className="w-full space-y-6">

            {/* BACK */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-gray-250 rounded-xl shadow-sm text-[#001A57] font-semibold transition-all duration-200 hover:bg-[#001A57] hover:text-white hover:border-[#001A57] hover:shadow-lg"
            >
              ← Kembali
            </button>
            

            {/* HEADER DETAIL */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detail Laporan #{data.kode_laporan}
                </h1>

                <p className="text-sm text-gray-400 mt-1">
                  Dilaporkan {formatTanggal(data.waktu_laporan)}
                </p>
              </div>

              <div className="lg:ml-auto">

                <span
                  className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    STATUS_COLOR[data.status_laporan]
                  }`}
                >
                  {STATUS_LABEL[data.status_laporan]}
                </span>

              </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT */}
              <div className="lg:col-span-2 space-y-6">

                {/* LOKASI */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    📍 Lokasi Pelanggaran
                  </h3>

                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Alamat Lengkap
                    </p>

                    <p className="text-sm font-semibold text-gray-700 mt-1">
                      {data.alamat}
                    </p>
                  </div>

                </div>

                {/* FOTO */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🖼️ Bukti Foto
                  </h3>

                  {data.foto_bukti ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/storage/${data.foto_bukti}`}
                      alt="Bukti"
                      className="rounded-2xl w-full h-72 object-cover"
                    />
                  ) : (
                    <div className="h-52 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                      Tidak ada foto
                    </div>
                  )}

                </div>

               <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">

  <h3 className="font-bold text-gray-800 mb-6">
    Status Penanganan
  </h3>

  <Timeline status={data.status_laporan} />

  {/* FOTO HASIL PENINDAKAN */}
  {data.tindakan &&
    data.tindakan.length > 0 &&
    data.tindakan[0].foto_tindakan && (
      <div className="mt-8 pt-6 border-t">

        <h4 className="font-bold text-gray-800 mb-4">
          📸 Bukti Penindakan Petugas
        </h4>

       <img
  src={`http://localhost:3000/uploads/${data.tindakan[0].foto_tindakan}`}
  alt="Bukti Penindakan"
  className="w-64 h-40 object-cover rounded-2xl border shadow-sm"
/>

        <div className="mt-4 bg-gray-50 p-4 rounded-xl">

          <p className="text-sm">
            <span className="font-semibold">
              Jenis Tindakan:
            </span>{' '}
            {data.tindakan[0].jenis_tindakan}
          </p>

          {data.tindakan[0].catatan_tindakan && (
            <p className="text-sm mt-2">
              <span className="font-semibold">
                Catatan Petugas:
              </span>{' '}
              {data.tindakan[0].catatan_tindakan}
            </p>
          )}

          {data.tindakan[0].waktu_selesai && (
            <p className="text-sm mt-2">
              <span className="font-semibold">
                Waktu Selesai:
              </span>{' '}
              {formatTanggal(data.tindakan[0].waktu_selesai)}
            </p>
          )}

        </div>

      </div>
    )}

</div>

              </div>

              {/* RIGHT */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">

                <h3 className="font-bold text-gray-800 mb-2">
                  Penilaian Layanan
                </h3>

                <p className="text-xs text-gray-400 mb-4">
                  Bantu meningkatkan layanan dengan memberikan penilaian.
                </p>

                <div className="flex gap-1 mb-4">

                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => setRating(i)}
                      className={`text-2xl transition ${
                        i <= rating
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}

                </div>

                <textarea
                  value={ulasan}
                  onChange={(e) => setUlasan(e.target.value)}
                  placeholder="Tulis pengalaman Anda..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={5}
                />

                <button
                  onClick={handleKirimPenilaian}
                  disabled={loading}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Mengirim...' : 'Kirim Penilaian'}
                </button>

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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
        ${
          active
            ? 'bg-blue-800 text-white'
            : 'text-blue-300 hover:bg-blue-900'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function Timeline({ status }) {
  const steps = [
    {
      key: 'menunggu_verifikasi',
      label: 'Menunggu Verifikasi'
    },
    {
      key: 'dalam_penanganan',
      label: 'Dalam Penanganan'
    },
    {
      key: 'ditindak',
      label: 'Selesai Ditindak'
    }
  ]

  const currentIndex = steps.findIndex(s => s.key === status)

  return (
    <div className="space-y-5">

      {steps.map((step, i) => {

        const active = i <= currentIndex

        return (
          <div key={step.key} className="flex gap-4">

            <div className="flex flex-col items-center">

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${
                  active
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {active ? '✓' : i + 1}
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-1
                  ${
                    active
                      ? 'bg-blue-700'
                      : 'bg-gray-200'
                  }`}
                />
              )}

            </div>

            <div className="pt-1">
              <p
                className={`font-semibold text-sm
                ${
                  active
                    ? 'text-gray-800'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
            </div>

          </div>
        )
      })}

    </div>
  )
}