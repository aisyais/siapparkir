import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AlertOctagon, ArrowRight, Clock, MapPin } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
        setError('Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-900 font-bold">Memuat Dashboard...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  const { statistik, antrean_verifikasi } = data;

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-2 space-y-8">
      {/* HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#001A57] to-[#0037C1] rounded-3xl p-8 shadow-lg mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-white/5 rounded-full translate-y-16" />

        <div className="relative">
          <span className="text-blue-200 text-xs uppercase tracking-[0.25em] font-bold">
            Sistem SiapParkir
          </span>

          <h1 className="text-4xl font-extrabold text-white mt-2">
            Dashboard Admin
          </h1>

          <p className="text-blue-100 mt-3 max-w-2xl text-sm leading-relaxed">
            Kelola verifikasi laporan, monitor aktivitas petugas lapangan,
            serta pantau statistik operasional dalam satu dashboard terintegrasi.
          </p>
        </div>

      </div>

      {/* TOP GRID: MENGGABUNGKAN GRADIENT CARD & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gradient Card yang ingin dipertahankan */}
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
        
        {/* Kolom Samping untuk Statistik Tambahan */}
        <div className="flex flex-col gap-6">
          <StatCard title="Petugas Aktif" value={statistik.petugas_aktif} icon={<Users size={20}/>} color="bg-white text-blue-600" />
          <StatCard title="Prioritas Tinggi" value={statistik.prioritas_tinggi} icon={<AlertOctagon size={20}/>} color="bg-white text-red-600" />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Antrean Verifikasi</h3>
          
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-[11px] uppercase tracking-wider bg-gray-50/50">
                <th className="p-5 font-semibold">Kode Laporan</th>
                <th className="p-5 font-semibold">Waktu</th>
                <th className="p-5 font-semibold">Lokasi</th>
                <th className="p-5 font-semibold">Jenis</th>
                <th className="p-5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {antrean_verifikasi?.map((item) => (
                <tr key={item.id_laporan} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5 font-bold text-blue-950 text-sm">{item.kode_laporan}</td>
                  <td className="p-5 text-gray-600 text-sm">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-5 text-gray-600 text-sm flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400"/> {item.alamat}
                  </td>
                  <td className="p-5 text-gray-600 text-sm">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-medium">{item.kategori?.nama_kategori || 'Umum'}</span>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => navigate('/internal/admin/laporan', { state: { selectedId: item.id_laporan } })}
                      className="bg-white border border-black text-black px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1 hover:bg-gray-700 hover:text-white"                  >
                      Verifikasi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`flex-1 ${color} p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4`}>
      <div className="bg-gray-50 p-3.5 rounded-2xl">{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-0.5">{value}</h3>
      </div>
    </div>
  );
}