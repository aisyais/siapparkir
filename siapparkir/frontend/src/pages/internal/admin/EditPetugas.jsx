import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../../../store/authStore'

export default function EditPetugas() {
  const navigate   = useNavigate()
  const { id }     = useParams()
  const token      = useAuthStore((s) => s.token)
  const fileInputRef = useRef(null)

  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [sukses, setSukses]       = useState('')
  const [wilayahList, setWilayahList] = useState([])
  const [preview, setPreview]     = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const [form, setForm] = useState({
    nama:           '',
    email:          '',
    no_hp:          '',
    nip:            '',
    id_wilayah:     '',
    status_petugas: 'aktif',
    status_akun:    'aktif',
    password:       '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [resPetugas, resWilayah] = await Promise.all([
          axios.get(`http://localhost:3000/api/admin/petugas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:3000/api/admin/wilayah', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ])

        const p = resPetugas.data?.data || {}
        setForm({
          nama:           p.nama           || '',
          email:          p.email          || '',
          no_hp:          p.no_hp          || '',
          nip:            p.nip            || '',
          id_wilayah:     p.id_wilayah     || '',
          status_petugas: p.status_petugas || 'aktif',
          status_akun:    p.status_akun    || 'aktif',
          password:       '',
        })

        if (p.foto_profil) {
          setPreview(`http://localhost:3000/uploads/${p.foto_profil}`)
        }

        setWilayahList(resWilayah.data?.data || [])
      } catch (err) {
        console.error(err)
        setError('Gagal memuat data petugas')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, token])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setError(''); setSukses('')
    if (!form.nama || !form.email)
      return setError('Nama dan email wajib diisi')

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('nama',           form.nama)
      fd.append('email',          form.email)
      fd.append('no_hp',          form.no_hp)
      fd.append('nip',            form.nip)
      fd.append('id_wilayah',     form.id_wilayah)
      fd.append('status_petugas', form.status_petugas)
      fd.append('status_akun',    form.status_akun)
      if (form.password.trim()) fd.append('password', form.password)
      if (selectedFile)          fd.append('foto_profil', selectedFile)

      await axios.put(
        `http://localhost:3000/api/admin/petugas/${id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      )
      setSukses('Data petugas berhasil diperbarui!')
      setTimeout(() => navigate('/internal/admin/petugas'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">⏳ Memuat data petugas...</p>
    </div>
  )

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-8">
  <button
    onClick={() => navigate('/internal/admin/petugas')}
    className="flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-[#001A57] font-semibold transition-all duration-200 hover:bg-[#001A57] hover:text-white hover:border-[#001A57] hover:shadow-lg"
  >
    ← Kembali
  </button>

  <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
    <div className="flex items-center gap-4">

      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Edit Data Petugas
        </h2>

        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Perbarui informasi akun dan data petugas yang sudah terdaftar.
        </p>
      </div>
    </div>
  </div>
</div>

      {/* Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-5">
          ⚠️ {error}
        </div>
      )}
      {sukses && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm mb-5">
          ✅ {sukses}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* KOLOM KIRI — Foto Profil */}
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Foto Profil</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative cursor-pointer group"
            >
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Foto profil"
                    className="w-full h-52 object-cover rounded-xl border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <span className="text-white text-sm font-bold">Ganti Foto</span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl h-52 flex flex-col items-center justify-center hover:bg-gray-50 transition">
                  <span className="text-4xl mb-2">📷</span>
                  <span className="text-sm text-gray-500 font-medium">Klik untuk upload foto</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG max 5MB</span>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-3">
              • Pastikan wajah terlihat jelas tanpa aksesoris
            </p>
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Status</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Status Petugas
                </label>
                <select
                  name="status_petugas"
                  value={form.status_petugas}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aktif">🟢 Aktif</option>
                  <option value="istirahat">🟡 Istirahat</option>
                  <option value="off">⚫ Off</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Status Akun
                </label>
                <select
                  name="status_akun"
                  value={form.status_akun}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN — Form Data */}
        <div className="lg:col-span-2 space-y-5">

          {/* Informasi Identitas */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-5">Informasi Identitas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Nama lengkap petugas"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@dishub.go.id"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  No. HP
                </label>
                <input
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  NIP
                </label>
                <input
                  name="nip"
                  value={form.nip}
                  onChange={handleChange}
                  placeholder="Nomor Induk Pegawai"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Wilayah Tugas
                </label>
                <select
                  name="id_wilayah"
                  value={form.id_wilayah}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Wilayah</option>
                  {wilayahList.map((w) => (
                    <option key={w.id_wilayah} value={w.id_wilayah}>
                      {w.nama_wilayah}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Keamanan Akun */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-1">Keamanan Akun</h3>
            <p className="text-xs text-gray-400 mb-4">
              Kosongkan jika tidak ingin mengubah password.
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                Password Baru
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password baru..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/internal/admin/petugas')}
              className="px-6 py-3.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Batalkan
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition"
            >
              {saving ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}