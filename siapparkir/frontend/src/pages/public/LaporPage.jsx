import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { kirimLaporan, getKategori } from '../../api/public.api'
import { tambahRiwayat } from '../../utils/riwayat'
import LocationPicker from '../../components/map/LocationPicker'

const STEPS = ['Bukti Foto', 'Detail Lokasi', 'Tinjau']

export default function LaporPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [kategoriList, setKategoriList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewFoto, setPreviewFoto] = useState(null)
  const [loadingGPS, setLoadingGPS] = useState(false)

  const [form, setForm] = useState({
    foto_bukti: null,
    nomor_plat: '',
    jenis_kendaraan: '',
    id_kategori: '',
    alamat: '',
    detail_alamat: '',
    deskripsi: '',
    latitude: null,
    longitude: null,
    akurasi_lokasi: null,
  })

  useEffect(() => {
    getKategori()
      .then(r => {
        console.log("ISI DATA API:", r.data);
        setKategoriList(r.data.data || r.data); 
      })
      .catch(err => console.error("Error:", err));
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (files) {
      setForm(prev => ({
        ...prev,
        [name]: files[0]
      }))

      setPreviewFoto(URL.createObjectURL(files[0]))
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleLocationSelect = ({ lat, lng, alamat, akurasi }) => {
    setForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      alamat: alamat || `Titik koordinat: ${lat}, ${lng}`,
      akurasi_lokasi: akurasi || null,
    }))
  }

  const tangkapLokasiOtomatis = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung GPS')
      return
    }

    setLoadingGPS(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          akurasi_lokasi: position.coords.accuracy
        }))

        setLoadingGPS(false)
      },
      () => {
        setLoadingGPS(false)
        setError('Gagal mendeteksi lokasi')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    )
  }

  const handleNext = () => {
    setError('')

    if (step === 0) {
      if (!form.foto_bukti) {
        return setError('Foto bukti wajib diunggah')
      }

      if (!form.nomor_plat.trim()) {
        return setError('Nomor plat wajib diisi')
      }
    }

    if (step === 1) {
      if (!form.latitude || !form.longitude) {
        return setError('Pilih lokasi kejadian')
      }

      if (!form.alamat.trim()) {
        return setError('Alamat wajib diisi')
      }

      if (!form.deskripsi.trim()) {
        return setError('Deskripsi wajib diisi')
      }
    }

    setStep(prev => prev + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const fd = new FormData()

      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') {
          fd.append(k, v)
        }
      })

      const res = await kirimLaporan(fd)

      const kode = res.data.data.kode_laporan

      tambahRiwayat(kode)

      navigate('/sukses', {
        state: {
          kode,
          alamat: form.alamat
        }
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal mengirim laporan'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>

          <span className="font-bold text-gray-800">
            SiapParkir
          </span>
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
            />

            <SidebarItem
              icon="📋"
              label="Laporan Masuk"
              onClick={() => navigate('/lapor')}
              active
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

        {/* MAIN */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">

          <div className="max-w-5xl mx-auto">

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Formulir Laporan Kendaraan
            </h1>

            <p className="text-gray-500 text-sm mb-6">
              Bantu menjaga ketertiban kota dengan melaporkan kendaraan parkir liar.
            </p>

            {/* STEPPER */}
            <div className="flex items-center gap-0 mb-8">

              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">

                  <div className="flex items-center gap-2">

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                      ${
                        i < step
                          ? 'bg-blue-700 text-white'
                          : i === step
                          ? 'bg-blue-700 text-white ring-4 ring-blue-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {i < step ? '✓' : i + 1}
                    </div>

                    <span
                      className={`text-sm font-medium hidden sm:block
                      ${
                        i === step
                          ? 'text-blue-700'
                          : i < step
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {s}
                    </span>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 ${
                        i < step ? 'bg-blue-700' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-5">
                ⚠️ {error}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6">

              {/* FORM */}
              <div className="flex-1 space-y-5">

                {/* STEP 0 */}
                {step === 0 && (
                  <>
                    <div className="bg-white rounded-2xl shadow-sm p-6">

                      <h3 className="font-semibold text-gray-800 mb-4">
                        Upload Foto Bukti
                      </h3>

                      <label className="block">

                        <input
                          type="file"
                          name="foto_bukti"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />

                        {previewFoto ? (
                          <div className="rounded-xl overflow-hidden border-2 border-blue-200 cursor-pointer">
                            <img
                              src={previewFoto}
                              alt="preview"
                              className="w-full h-52 object-cover"
                            />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer">
                            <div className="text-4xl mb-3">📷</div>

                            <p className="text-gray-600 text-sm font-medium">
                              Klik untuk upload foto
                            </p>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

                      <h3 className="font-semibold text-gray-800">
                        Informasi Kendaraan
                      </h3>

                      <input
                        name="nomor_plat"
                        value={form.nomor_plat}
                        onChange={handleChange}
                        placeholder="Nomor Plat"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <select
                        name="jenis_kendaraan"
                        value={form.jenis_kendaraan}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Jenis Kendaraan</option>
                        <option value="Motor">Motor</option>
                        <option value="Mobil">Mobil</option>
                        <option value="Bus">Bus</option>
                        <option value="Truk">Truk</option>
                      </select>

                      <select
                        name="id_kategori"
                        value={form.id_kategori}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Pilih Kategori</option>

                        {kategoriList.map(k => (
                          <option
                            key={k.id_kategori}
                            value={k.id_kategori}
                          >
                            {k.nama_kategori}
                          </option>
                        ))}
                      </select>

                    </div>
                  </>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

                    <textarea
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Alamat kejadian"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <textarea
                      name="deskripsi"
                      value={form.deskripsi}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Deskripsi kejadian"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

                    {previewFoto && (
                      <img
                        src={previewFoto}
                        alt="preview"
                        className="w-full h-56 object-cover rounded-xl"
                      />
                    )}

                    <div>
                      <p className="text-sm text-gray-500">
                        Nomor Plat
                      </p>

                      <p className="font-bold text-lg">
                        {form.nomor_plat}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Lokasi
                      </p>

                      <p>
                        {form.alamat}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Deskripsi
                      </p>

                      <p>
                        {form.deskripsi}
                      </p>
                    </div>

                  </div>
                )}

              </div>

              {/* MAP */}
              {step < 2 && (
                <div className="w-full lg:w-80 space-y-4">

                  <div className="bg-white rounded-2xl shadow-sm p-5">

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="font-semibold text-gray-800 text-sm">
                        Lokasi Kejadian
                      </h3>

                      <button
                        type="button"
                        onClick={tangkapLokasiOtomatis}
                        disabled={loadingGPS}
                        className="text-xs font-bold text-blue-700"
                      >
                        📍 {loadingGPS ? 'Mencari...' : 'Deteksi'}
                      </button>
                    </div>

                    <LocationPicker
                      onSelect={handleLocationSelect}
                      value={
                        form.latitude && form.longitude
                          ? {
                              lat: form.latitude,
                              lng: form.longitude,
                              akurasi: form.akurasi_lokasi
                            }
                          : null
                      }
                    />

                  </div>

                </div>
              )}

            </div>

            {/* BUTTON */}
            <div className="flex gap-3 mt-6">

              {step > 0 ? (
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="px-6 py-3 border border-gray-300 rounded-xl"
                >
                  ← Kembali
                </button>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 rounded-xl"
                >
                  Batal
                </button>
              )}

              {step < 2 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold"
                >
                  Lanjut →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold disabled:opacity-60"
                >
                  {loading ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              )}

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