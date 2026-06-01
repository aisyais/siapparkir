import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, LayoutDashboard, ClipboardList, LogOut, Users } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

export default function ProfilPetugas() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: '',
    status_petugas: 'aktif' // Default status
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/avatar-petugas.jpg');

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/petugas/profil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("DATA PROFIL:", res.data);
        const data = res.data.data;
        setFormData(data);
        if (data.foto_profil) setPreviewUrl(`http://localhost:3000/uploads/${data.foto_profil}`);
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
      }
    };
    if (token) fetchProfil();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('email', formData.email);
    data.append('no_hp', formData.no_hp);
    data.append('status_petugas', formData.status_petugas); // Pastikan ini terkirim
    
    if (formData.password) data.append('password', formData.password);
    if (selectedFile) data.append('foto_profil', selectedFile);

    try {
      await axios.put('http://localhost:3000/api/petugas/profil/update', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      alert('Profil berhasil diperbarui!');
      setIsEditing(false);
      
      // PENTING: Refresh data agar tampilan sesuai database terbaru
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#001A57] rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">
              P
            </span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">
              SiapParkir
            </h1>

            <p className="text-xs text-gray-400 mt-0.5">
              Profil Petugas Lapangan
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/internal/petugas/profil')}>
          <img
            src={previewUrl}
            alt="Petugas"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
            onError={(e) => {
              e.target.src = '/avatar-petugas.jpg';
            }}
          />
        </button>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-[#001A57] text-white flex-col justify-between p-6 shadow-xl">
          <div className="space-y-8">
            <button 
                onClick={() => navigate('/internal/petugas/profil')}
                className="w-full flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-left"
                >
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <div className="text-xs text-gray-400 font-medium">Masuk sebagai</div>
                    <div className="text-sm font-bold tracking-wide">Petugas</div>
                </div>
                </button>
            <nav className="space-y-1.5">
              <SidebarItem icon={<LayoutDashboard size={16}/>} label="Daftar Tugas" onClick={() => navigate('/internal/petugas')} />
              <SidebarItem icon={<ClipboardList size={16}/>} label="Laporan Masuk" onClick={() => navigate('/internal/petugas/laporan')} />
            </nav>
          </div>
          <div className="pt-6 border-t border-white/10">
            <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-red-300 hover:bg-red-500/10 transition-all">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Account Information</h2>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="bg-[#001A57] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#00133f] transition-all"
              >
                {isEditing ? 'Simpan Perubahan' : 'Edit Profil'}
              </button>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-6 mb-8">
                <img src={previewUrl} alt="Profil" className="w-24 h-24 rounded-full object-cover border-4 border-gray-100" />
                {isEditing && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Pilih Foto Baru</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase">Full Name</label>
                  {isEditing ? <input name="nama" value={formData.nama || ''} onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none" /> : <p className="font-semibold text-lg">{formData.nama}</p>}
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase">Email Address</label>
                  {isEditing ? <input name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none" /> : <p className="font-semibold text-lg">{formData.email}</p>}
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase">Phone Number</label>
                  {isEditing ? <input name="no_hp" value={formData.no_hp || ''} onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none" /> : <p className="font-semibold text-lg">{formData.no_hp}</p>}
                </div>
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase">Status Petugas</label>
                  {isEditing ? (
                    <select 
                      name="status_petugas" 
                      // Pastikan ada fallback ke string kosong agar tidak undefined
                      value={formData.status_petugas || ''} 
                      onChange={handleInputChange} 
                      className="w-full border-b-2 py-2 outline-none bg-transparent font-semibold text-lg"
                    >
                      <option value="">-- Pilih Status --</option>
                      <option value="aktif">Aktif</option>
                      <option value="istirahat">Istirahat</option>
                      <option value="off">Off</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-lg">{formData.status_petugas || 'Belum diatur'}</p>
                  )}
                </div>
                <div className="col-span-2 pt-6"> {/* Hapus class 'border-t' */}
                    <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Password</label>
                    {isEditing ? (
                        <input 
                        type="password" 
                        name="password" 
                        placeholder="Masukkan password baru" 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#001A57] focus:ring-1 focus:ring-[#001A57]" 
                        />
                    ) : (
                        <div className="w-full bg-gray-50 px-4 py-3 rounded-lg text-gray-400 font-semibold text-lg">
                        ••••••••
                        </div>
                    )}
                    </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${active ? 'bg-[#BCE3FF] text-[#001A57]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}