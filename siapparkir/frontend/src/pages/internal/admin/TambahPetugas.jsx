import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function TambahPetugas() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    nip: '',
    id_wilayah: '',
    status_petugas: 'aktif'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [wilayahList, setWilayahList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch wilayah list pada mount
  React.useEffect(() => {
    const fetchWilayah = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/admin/wilayah', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWilayahList(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err) {
        console.error('Gagal fetch wilayah:', err);
      }
    };
    fetchWilayah();
  }, [token]);

  const handleSubmit = async () => {
    // Validasi input
    if (!formData.nama.trim()) {
      alert('Nama harus diisi');
      return;
    }
    if (!formData.email.trim()) {
      alert('Email harus diisi');
      return;
    }
    if (!formData.id_wilayah) {
      alert('Wilayah harus dipilih');
      return;
    }
    if (!selectedFile) {
      alert('Foto profil harus diunggah');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('nama', formData.nama);
      data.append('email', formData.email);
      data.append('no_hp', formData.no_hp);
      data.append('nip', formData.nip);
      data.append('id_wilayah', formData.id_wilayah);
      data.append('status_petugas', formData.status_petugas);
      data.append('foto_profil', selectedFile);

       await axios.post('http://localhost:3000/api/admin/petugas', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        },
      });
      
      alert('Petugas berhasil ditambahkan!');
      navigate('/internal/admin/petugas');
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      console.error('Gagal menyimpan:', err.response || err);
      alert('Gagal menyimpan data: ' + message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 space-y-2">
        <button
          onClick={() => navigate('/internal/admin/petugas')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 w-fit"
        >
          <span className="text-base">←</span>
          Kembali
        </button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Tambah Petugas Baru
          </h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-2xl">
            Lengkapi detail informasi untuk mendaftarkan personil operasional baru.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FOTO PROFIL */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Foto Profil Petugas</h3>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <div 
            onClick={() => fileInputRef.current.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:bg-gray-50 transition cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
          >
            {preview ? (
              <div className="w-full h-80 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-full w-auto object-contain" 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="text-5xl mb-4">📷</div>
                <p className="text-sm text-gray-600 font-bold">Klik untuk pilih foto</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-600 mt-4 flex items-center">• Pastikan wajah terlihat jelas tanpa aksesoris.</p>
        </div>

        {/* FORM IDENTITAS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Informasi Identitas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input name="email" onChange={handleInputChange} type="email" placeholder="Masukkan email" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                <input name="nama" onChange={handleInputChange} type="text" placeholder="Masukkan nama lengkap" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">No HP</label>
                  <input name="no_hp" onChange={handleInputChange} type="text" placeholder="08xx-xxxx-xxxx" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">NIP</label>
                  <input name="nip" onChange={handleInputChange} type="text" placeholder="Nomor identitas pegawai" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Wilayah Tugas *</label>
                  <select name="id_wilayah" onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                    <option value="">Pilih Wilayah</option>
                    {wilayahList.map((w) => (
                      <option key={w.id_wilayah} value={w.id_wilayah}>{w.nama_wilayah}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status Awal</label>
                  <select name="status_petugas" onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="aktif">Aktif</option>
                    <option value="istirahat">Istirahat</option>
                    <option value="off">Off</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="flex-1 px-6 py-4 rounded-xl border font-semibold hover:bg-gray-50">Batalkan</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 px-6 py-4 rounded-xl bg-blue-950 text-white font-semibold disabled:opacity-50">{loading ? 'Menyimpan...' : 'Simpan Data Petugas'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
