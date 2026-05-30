import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function TambahPetugas() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const fileInputRef = useRef(null);

  // State untuk form
  const [formData, setFormData] = useState({
    id_petugas: '',
    nama: '',
    status: 'Aktif',
    wilayah: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

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

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      data.append('id_petugas', formData.id_petugas);
      data.append('nama', formData.nama);
      data.append('status', formData.status);
      data.append('wilayah', formData.wilayah);
      if (selectedFile) data.append('foto', selectedFile);

      // Log untuk debug di console browser
      console.log("Mengirim data:", formData); 

      const response = await axios.post('http://localhost:3000/api/admin/petugas/tambah', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        },
      });
      
      alert('Petugas berhasil ditambahkan!');
      navigate('/internal/admin/petugas');
    } catch (err) {
      // Menampilkan pesan error dari backend jika ada
      const message = err.response?.data?.message || err.message;
      console.error('Gagal menyimpan:', err.response || err);
      alert('Gagal menyimpan data: ' + message); 
    }
  };

  return (
    <LayoutAdmin>
      <div className="mb-8">
        <button onClick={() => navigate('/internal/admin/petugas')} className="flex items-center text-gray-500 hover:text-gray-800 mb-2 transition">
          <span className="mr-2">←</span> Kembali ke Manajemen Petugas
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Tambah Petugas Baru</h2>
        <p className="text-gray-500 mt-1">Lengkapi detail informasi untuk mendaftarkan personil operasional baru.</p>
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
            {preview ? <img src={preview} alt="Preview" className="max-h-40 rounded-xl" /> : (
              <>
                <div className="text-4xl mb-3">📷</div>
                <p className="text-sm text-gray-600 font-medium">Klik untuk pilih foto</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
              </>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">ID Petugas</label>
                <input name="id_petugas" onChange={handleInputChange} type="text" placeholder="Contoh: DSH-2023-001" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status Awal</label>
                <select name="status" onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="Aktif">Aktif</option>
                  <option value="Istirahat">Istirahat</option>
                  <option value="Off">Off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input name="nama" onChange={handleInputChange} type="text" placeholder="Masukkan nama lengkap" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Wilayah Tugas</label>
                <input name="wilayah" onChange={handleInputChange} type="text" placeholder="Masukkan wilayah" className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="flex-1 px-6 py-4 rounded-xl border font-semibold">Batalkan</button>
            <button onClick={handleSubmit} className="flex-1 px-6 py-4 rounded-xl bg-blue-950 text-white font-semibold">Simpan Data Petugas</button>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}

/* Komponen LayoutAdmin, SidebarItem (sama dengan sebelumnya) */
function LayoutAdmin({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
          <div><h1 className="font-bold text-gray-800 leading-none">Admin Dishub</h1><p className="text-xs text-gray-400 mt-0.5">Sistem Verifikasi Laporan</p></div>
        </div>
        {/* FOTO PROFIL DI HEADER */}
        <button onClick={() => navigate('/internal/admin/profil')}>
           <img src="/path-to-admin-photo.jpg" alt="Admin" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
        </button>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-blue-950 flex-col">
          <div 
            onClick={() => navigate('/internal/admin/profil')} 
            className="px-5 py-5 border-b border-blue-900 cursor-pointer hover:bg-blue-900 transition-colors"
            >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white text-lg">
                🛡️
                </div>
                <div>
                <h2 className="text-white font-bold text-sm">Administrator</h2>
                <p className="text-blue-300 text-xs">Dishub Kota</p>
                </div>
            </div>
            </div>
          <div className="space-y-1 flex-1 p-4">
            <SidebarItem icon="📊" label="Dashboard" onClick={() => navigate('/internal/admin')} />
            <SidebarItem icon="📋" label="Laporan Masuk" onClick={() => navigate('/internal/admin/laporan')} />
            <SidebarItem icon="📈" label="Penilaian Masyarakat" onClick={() => navigate('/internal/admin/penilaian')} />
            <SidebarItem icon="⚙️" label="Manajemen Petugas" onClick={() => navigate('/internal/admin/petugas')} />
          </div>
          <div className="p-4 border-t border-blue-900"><button onClick={() => navigate('/')} className="w-full text-blue-300 hover:text-white text-sm py-2 transition">← Keluar</button></div>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-900 hover:text-white'}`}>
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}