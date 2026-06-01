import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';
import Swal from 'sweetalert2';

export default function ProfilPetugas() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: '',
    status_petugas: 'aktif'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/avatar-petugas.jpg');

  useEffect(() => {
    let isMounted = true;
    const fetchProfil = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/petugas/profil', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (isMounted) {
          const data = res.data.data;
          setFormData(data);
          if (data.foto_profil) {
            setPreviewUrl(`http://localhost:3000/uploads/${data.foto_profil}`);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
      }
    };

    if (token) fetchProfil();
    return () => { isMounted = false; };
  }, [token]);

  const handleSave = async () => {
    // 1. Loading State yang cantik
    Swal.fire({
      title: 'Menyimpan Perubahan...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const data = new FormData();
    data.append('nama', formData.nama || '');
    data.append('email', formData.email || '');
    data.append('no_hp', formData.no_hp || '');
    data.append('status_petugas', formData.status_petugas || '');
    if (formData.password) data.append('password', formData.password);
    if (selectedFile) data.append('foto_profil', selectedFile);

    try {
      const res = await axios.put('http://localhost:3000/api/petugas/profil/update', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // 2. Sukses tanpa reload
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profil Anda telah diperbarui.',
        confirmButtonColor: '#001A57',
        timer: 2000
      });

      setIsEditing(false);
      // Refresh data secara halus tanpa reload seluruh halaman
      setFormData(res.data.data); 
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Terjadi kesalahan sistem.',
        confirmButtonColor: '#d33'
      });
    }
  };

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

  return (
    <div className="max-w-8xl mx-auto p-4">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Account Information</h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-[#001A57] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#00133f] transition-all"
        >
          {isEditing ? 'Simpan Perubahan' : 'Edit Profil'}
        </button>
      </div>
      
      {/* CONTENT CARD */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <select name="status_petugas" value={formData.status_petugas || ''} onChange={handleInputChange} className="w-full border-b-2 py-2 outline-none bg-transparent font-semibold text-lg">
                <option value="aktif">Aktif</option>
                <option value="istirahat">Istirahat</option>
                <option value="off">Off</option>
              </select>
            ) : (
              <p className="font-semibold text-lg">{formData.status_petugas || 'Belum diatur'}</p>
            )}
          </div>
          <div className="col-span-2 pt-6">
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Password</label>
            {isEditing ? (
              <input type="password" name="password" placeholder="Masukkan password baru" onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#001A57] focus:ring-1 focus:ring-[#001A57]" />
            ) : (
              <div className="w-full bg-gray-50 px-4 py-3 rounded-lg text-gray-400 font-semibold text-lg">••••••••</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}