import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { kirimLaporan, getKategori } from '../../api/public.api'
import { tambahRiwayat } from '../../utils/riwayat'
import LocationPicker from '../../components/map/LocationPicker'
import { AlertCircle, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

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
      return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Browser Anda tidak mendukung deteksi lokasi.' });
    }

    setLoadingGPS(true);
    
    // Toast cantik saat proses mencari lokasi
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          akurasi_lokasi: position.coords.accuracy
        }));
        setLoadingGPS(false);
        Toast.fire({ icon: 'success', title: 'Lokasi berhasil dideteksi!' });
      },
      () => {
        setLoadingGPS(false);
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Izin lokasi ditolak atau GPS tidak aktif.' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleNext = () => {
    // Validasi Step 0
    if (step === 0 && (!form.foto_bukti || !form.nomor_plat.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Pastikan foto dan plat nomor sudah diisi.' });
    }

    // Validasi Step 1
    if (step === 1 && (!form.latitude || !form.alamat.trim() || !form.deskripsi.trim())) {
      return Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Mohon lengkapi lokasi, alamat, dan deskripsi.' });
    }

    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    Swal.fire({
      title: 'Mengirim Laporan...',
      text: 'Mohon tunggu, kami sedang memproses data Anda.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== '') fd.append(k, v);
      });

      const res = await kirimLaporan(fd);
      const kode = res.data.data.kode_laporan;

      tambahRiwayat(kode);
      Swal.close(); // Tutup loading

      navigate('/sukses', { state: { kode, alamat: form.alamat } });
      
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim',
        text: err.response?.data?.message || 'Terjadi kesalahan sistem.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1550px] mx-auto">

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            {/* Ikon dengan efek glow halus */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-lg opacity-20"></div>
              <div className="relative p-3 bg-blue-700 rounded-2xl text-white shadow-lg">
                <AlertCircle size={28} />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                Formulir Laporan
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Sistem SiapParkir - Aman & Terverifikasi
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 w-full text-sm leading-relaxed bg-gray-100 p-4 rounded-xl border border-gray-200">
            Bantu kami menjaga ketertiban kota dengan melaporkan kendaraan yang parkir sembarangan. Laporan Anda akan segera ditinjau oleh petugas lapangan kami.
          </p>
        </div>

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
                {previewFoto ? (
                  <div 
                    onClick={() => setPreviewFoto(null)} 
                    className="relative group rounded-xl overflow-hidden border-2 border-blue-200 w-full max-w-lg mx-auto shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
                  >
                    <img
                      src={previewFoto}
                      alt="preview"
                      className="w-full h-auto block" 
                    />
                    
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-red-600 px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2">
                        Klik untuk Hapus
                      </span>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="fileInput" className="block cursor-pointer">
                    <input type="file" name="foto_bukti" id="fileInput" accept="image/*" onChange={handleChange} className="hidden" />
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center max-w-sm mx-auto hover:border-blue-400 hover:bg-blue-50 transition">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-gray-700 font-semibold text-sm">Klik untuk upload foto</p>
                    </div>
                  </label>
                )}

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
                  <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <img
                      src={previewFoto}
                      alt="preview"
                      className="w-full h-auto max-h-[300px] object-contain block"
                    />
                  </div>
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
            <div className="w-full lg:w-100 space-y-4">
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
              className="px-6 py-3 border border-gray-300 rounded-xl transition-all duration-200 hover:shadow-md hover:border-gray-400 cursor-pointer"
            >
              ← Kembali
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-xl transition-all duration-200 hover:shadow-md hover:border-gray-400 cursor-pointer"
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
  )
}