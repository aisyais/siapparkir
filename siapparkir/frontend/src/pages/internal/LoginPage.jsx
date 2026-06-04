import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import { Shield } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validasi Input (Opsional tapi disarankan)
    if (!form.email || !form.password) {
      return Swal.fire({
        icon: 'warning',
        title: 'Data Kurang',
        text: 'Email dan password harus diisi!',
        confirmButtonColor: '#001A57'
      });
    }

    setLoading(true);
    setError('');

    // 2. Loading State yang Modern
    Swal.fire({
      title: 'Sedang Memverifikasi...',
      text: 'Mohon tunggu, kami sedang memeriksa kredensial Anda.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await login(form.email, form.password);
      const { token, user } = res.data.data;
      
      setAuth(user, token);

      // 3. Sukses dengan animasi yang halus
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: `Selamat datang, ${user.nama || 'Pengguna'}`,
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate(user.role === 'admin' ? '/internal/admin' : '/internal/petugas');
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email atau password salah.';
      
      // 4. Error handling yang lebih komunikatif
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: errorMessage,
        confirmButtonColor: '#d33'
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row antialiased font-sans">
      
      {/* SISI KIRI: Visual/Gambar Branding */}
      <div className="relative w-full lg:w-[53%] min-h-[300px] lg:min-h-screen bg-[#0A1931] flex flex-col justify-end p-8 sm:p-12 lg:p-16 text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200')` }}
        />
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ketertiban Dimulai Dari Sini.
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
            Platform pelaporan resmi Dinas Perhubungan untuk menindak pelanggaran parkir demi kenyamanan dan kelancaran lalu lintas kota.
          </p>
        </div>
      </div>

      {/* SISI KANAN: Form Login */}
      <div className="w-full lg:w-[47%] flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo & Judul */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#001A57] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md tracking-wider">
              P
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">SiapParkir</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">Selamat Datang</h2>
            <p className="text-gray-500 text-sm">Portal internal petugas & admin.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Email</label>
              <input
                type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="nama@instansi.go.id"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kata Sandi</label>
              <input
                type="password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition"
                required
              />
            </div>
            
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-[#001A57] hover:bg-[#00133f] text-white rounded-xl font-bold transition-all disabled:opacity-60 shadow-lg mt-2"
            >
              {loading ? 'Memproses...' : 'Masuk →'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 pt-4">
            Akses ini terbatas hanya untuk staf resmi Dinas Perhubungan.
          </p>
        </div>
      </div>
    </div>
  );
}