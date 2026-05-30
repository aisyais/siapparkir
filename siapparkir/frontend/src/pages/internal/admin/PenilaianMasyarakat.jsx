import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function PenilaianMasyarakat() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  
  const [dataPenilaian, setDataPenilaian] = useState([]);
  const [statistik, setStatistik] = useState({ total_laporan: 0, kasus_verifikasi: 0, umpan_balik: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/admin/penilaian', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Mengamankan data: Pastikan dataPenilaian selalu berupa array
      setDataPenilaian(Array.isArray(res.data.data) ? res.data.data : []);
      setStatistik(res.data.statistik || { total_laporan: 0, kasus_verifikasi: 0, umpan_balik: 0 });
    } catch (err) {
      console.error('Gagal mengambil data:', err);
      setDataPenilaian([]); // Jika error, set ke array kosong agar tidak crash
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAdmin>
      {/* HEADER PAGE */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Penilaian Masyarakat</h2>

      {loading ? (
        <div className="bg-white p-10 rounded-2xl border text-center">Memuat data...</div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard title="LAPORAN AKTIF" value={statistik.total_laporan} icon="📊" />
            <StatCard title="KASUS TERVERIFIKASI" value={statistik.kasus_verifikasi} icon="✅" />
            <StatCard title="UMPAN BALIK DITERIMA" value={statistik.umpan_balik} icon="💬" />
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Daftar Penilaian</h3>
              <p className="text-sm text-gray-500">Respon komunitas terbaru dan tingkat kepuasan.</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">Kode Laporan</th>
                  <th className="px-6 py-4 text-left">Penilaian</th>
                  <th className="px-6 py-4 text-left">Komentar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Pengecekan Array dilakukan di sini */}
                {dataPenilaian.length > 0 ? (
                  dataPenilaian.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-blue-900">{item.kode_laporan}</td>
                      <td className="px-6 py-4 text-yellow-500 font-bold">{item.rating} <span className="text-gray-300">★</span></td>
                      <td className="px-6 py-4 text-gray-600 italic">"{item.komentar}"</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-400">Belum ada penilaian masuk</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </LayoutAdmin>
  );
}

// Komponen StatCard
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="text-xs font-bold text-gray-400 mb-2">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-black text-gray-900">{value}</div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
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
            <SidebarItem icon="📈" label="Penilaian Masyarakat" active onClick={() => navigate('/internal/admin/penilaian')} />
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