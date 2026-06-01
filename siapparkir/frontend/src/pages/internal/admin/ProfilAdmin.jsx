import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function ProfilAdmin() {
  const token = useAuthStore((s) => s.token);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/avatar-admin.jpg');
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: '',
    foto_profil: '' // Kosongkan saat tampil, isi hanya jika ingin ganti
  });

  // 1. Ambil data asli dari database saat halaman dimuat
  useEffect(() => {
    const fetchProfil = async () => {
        try {
        const res = await axios.get('http://localhost:3000/api/admin/profil', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Data diterima dari API:", res.data); // Cek ini di console browser
        const data = res.data.data;

        setFormData({
          nama: data.nama || '',
          email: data.email || '',
          no_hp: data.no_hp || '',
          password: ''
        });
        if (data.foto_profil) {
          setPreviewUrl(
            `http://localhost:3000/uploads/${data.foto_profil}`
          );
        }
        } catch (err) {
        console.error("Gagal mengambil data profil:", err);
        }
    };
    if (token) fetchProfil(); // Pastikan token ada sebelum memanggil API
    }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const data = new FormData();

      data.append('nama', formData.nama);
      data.append('email', formData.email);
      data.append('no_hp', formData.no_hp);

      if (formData.password) {
        data.append('password', formData.password);
      }

      if (selectedFile) {
        data.append('foto_profil', selectedFile);
      }

      await axios.put(
        'http://localhost:3000/api/admin/profil/update',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Profil berhasil diperbarui');
      setIsEditing(false);

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data');
    }
  };

  return (
    <LayoutAdmin previewUrl={previewUrl}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Account Information</h2>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="bg-blue-950 text-white px-6 py-2 rounded-xl font-bold"
          >
            {isEditing ? 'Simpan Perubahan' : 'Edit Profil'}
          </button>
        </div>
        
        <div className="bg-white rounded-3xl p-8 border shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <img
              src={previewUrl}
              alt="Admin"
              className="w-10 h-10 rounded-full border border-gray-200 object-cover"
              onError={(e) => {
                e.target.src = '/avatar-admin.jpg';
              }}
            />

            {isEditing && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Pilih Foto Baru
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm text-gray-500"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8">
            {/* INPUT FIELD */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase">Full Name</label>
              {isEditing ? (
                <input name="nama" value={formData.nama || ''} onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none" />
              ) : <p className="font-semibold text-lg">{formData.nama}</p>}
            </div>

            <div>
              <label className="text-gray-400 text-xs font-bold uppercase">Email Address</label>
              {isEditing ? (
                <input name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none" />
              ) : <p className="font-semibold text-lg">{formData.email}</p>}
            </div>

            <div>
              <label className="text-gray-400 text-xs font-bold uppercase">Phone Number</label>
              {isEditing ? (
                <input name="no_hp" value={formData.no_hp || ''} onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none" />
              ) : <p className="font-semibold text-lg">{formData.no_hp}</p>}
            </div>

            <div className="col-span-2 border-t pt-6">
              <label className="text-gray-400 text-xs font-bold uppercase">Password (Kosongkan jika tidak ingin ganti)</label>
              {isEditing ? (
                <input type="password" name="password" placeholder="Masukkan password baru" onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none" />
              ) : <p className="font-semibold text-lg text-gray-400">••••••••</p>}
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}

/* Komponen LayoutAdmin, SidebarItem (sama dengan sebelumnya) */
function LayoutAdmin({ children, previewUrl }) {
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
          <img
            src={previewUrl}
            alt="Admin"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
            onError={(e) => {
              e.target.src = '/avatar-admin.jpg';
            }}
          />
        </button>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-blue-950 flex-col">
          <div 
            onClick={() => navigate('/internal/admin/profil')} 
            className="px-5 py-5 border-b border-blue-900 cursor-pointer hover:bg-blue-900 transition-colors"
            >
            <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Admin"
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                  onError={(e) => {
                    e.target.src = '/avatar-admin.jpg';
                  }}
                />
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