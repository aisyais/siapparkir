import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          window.location.href = '/login';
          return;
        }
        setError('Gagal memuat: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">⏳ Memuat...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 font-semibold">{error}</div>;

  const { statistik, antrean_verifikasi } = data;

  return (
    <LayoutAdmin>
      <div className="max-w-8xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Sistem</h1>
          <p className="text-gray-500 text-sm mt-1">Monitoring laporan parkir liar dan aktivitas petugas.</p>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-sm">
            <div className="absolute right-5 bottom-[-20px] text-[180px] font-black opacity-5 leading-none select-none">A</div>
            <div className="relative z-10">
              <p className="text-blue-300 text-sm font-semibold tracking-wide">TOTAL LAPORAN BULAN INI</p>
              <h3 className="text-6xl font-bold my-5">{statistik.total_bulan_ini}</h3>
              <div className="grid grid-cols-3 gap-4 border-t border-blue-800 pt-5">
                <div><p className="text-blue-300 text-xs uppercase">Menunggu</p><p className="font-bold text-2xl mt-1">{statistik.menunggu}</p></div>
                <div><p className="text-blue-300 text-xs uppercase">Diproses</p><p className="font-bold text-2xl mt-1">{statistik.diproses}</p></div>
                <div><p className="text-blue-300 text-xs uppercase">Selesai</p><p className="font-bold text-2xl mt-1">{statistik.selesai}</p></div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div><p className="text-xs text-gray-400 uppercase font-bold">Petugas Aktif</p><p className="text-3xl font-bold text-gray-800 mt-1">{statistik.petugas_aktif}</p></div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">👮</div>
            </div>
            <div className="bg-white border border-red-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div><p className="text-xs text-gray-400 uppercase font-bold">Prioritas Tinggi</p><p className="text-3xl font-bold text-red-600 mt-1">{statistik.prioritas_tinggi}</p></div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-xl">🚨</div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">Antrean Verifikasi Laporan</h3>
            <button className="text-sm font-semibold text-blue-700 hover:text-blue-900">Lihat Semua →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr><th className="p-4">ID Laporan</th><th className="p-4">Waktu</th><th className="p-4">Lokasi</th><th className="p-4">Jenis</th><th className="p-4 text-right">Aksi</th></tr>
              </thead>
              <tbody>
                {antrean_verifikasi?.map((item) => (
                  <tr key={item.id_laporan} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-blue-900">{item.kode_laporan}</td>
                    <td className="p-4 text-gray-600">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 text-gray-600 truncate max-w-xs">{item.alamat}</td>
                    <td className="p-4 text-gray-600">{item.kategori?.nama_kategori || 'N/A'}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => navigate(`/internal/admin/laporan/${item.id_laporan}`)} className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition">Proses</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
}

// LAYOUT COMPONENT
function LayoutAdmin({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
          <div><h1 className="font-bold text-gray-800 leading-none">Admin Dishub</h1><p className="text-xs text-gray-400 mt-0.5">Sistem Verifikasi Laporan</p></div>
        </div>
        <button onClick={() => navigate('/internal/admin/profil')}>
           <img src="/path-to-admin-photo.jpg" alt="Admin" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
        </button>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-blue-950 flex-col">
          <div onClick={() => navigate('/internal/admin/profil')} className="px-5 py-5 border-b border-blue-900 cursor-pointer hover:bg-blue-900 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white text-lg">🛡️</div>
              <div><h2 className="text-white font-bold text-sm">Administrator</h2><p className="text-blue-300 text-xs">Dishub Kota</p></div>
            </div>
          </div>
          <div className="space-y-1 flex-1 p-4">
            <SidebarItem icon="📊" label="Dashboard" active onClick={() => navigate('/internal/admin')} />
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