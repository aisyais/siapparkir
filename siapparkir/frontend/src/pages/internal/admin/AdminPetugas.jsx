import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function ManajemenPetugas() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [petugasList, setPetugasList] = useState([]);
  const [filteredPetugas, setFilteredPetugas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Statistik (Tetap dipertahankan)
  const [statistik, setStatistik] = useState({
    total: 0,
    aktif: 0,
    penugasan: 0,
    tersedia: 0,
  });

  useEffect(() => {
    fetchPetugas();
  }, []);

  const fetchPetugas = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/admin/petugas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.data) ? res.data.data : [];

      setPetugasList(data);
      setFilteredPetugas(data);

      setStatistik({
        total: data.length,
        aktif: data.filter((p) => p.status === 'Aktif').length,
        penugasan: data.filter((p) => p.status === 'Penugasan').length,
        tersedia: data.filter((p) => p.status === 'Tersedia').length,
      });
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH LOGIC (Dipertahankan persis)
  useEffect(() => {
    const keyword = search.toLowerCase();
    const filtered = petugasList.filter((p) => {
      return (
        p.id_petugas?.toString().toLowerCase().includes(keyword) ||
        p.nama?.toLowerCase().includes(keyword)
      );
    });
    setFilteredPetugas(filtered);
  }, [search, petugasList]);

  return (
    <LayoutAdmin>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Manajemen Petugas Lapangan
      </h2>

      {loading ? (
        <div className="bg-white p-10 rounded-2xl border text-center">
          Memuat data petugas...
        </div>
      ) : (
        <>
          {/* STAT CARDS (Persis seperti kode asal Anda) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="TOTAL PETUGAS" value={statistik.total} icon="🏢" />
            <StatCard title="PETUGAS AKTIF" value={statistik.aktif} icon="👤" />
            <StatCard title="DALAM PENUGASAN" value={statistik.penugasan} icon="🚓" />
            <StatCard title="TERSEDIA" value={statistik.tersedia} icon="📅" />
          </div>

          {/* ACTIONS (Persis seperti kode asal Anda) */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Cari ID atau nama petugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => navigate('/internal/admin/tambah_petugas')}
              className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>+</span> Tambah Petugas
            </button>
          </div>

          {/* TABLE (Persis seperti kode asal Anda) */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 text-left">ID Petugas</th>
                    <th className="px-6 py-4 text-left">Nama Petugas</th>
                    <th className="px-6 py-4 text-left">Wilayah Tugas</th>
                    <th className="px-6 py-4 text-left">Penindakan</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPetugas.length > 0 ? (
                    filteredPetugas.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium">#{p.id_petugas}</td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                            {p.nama?.charAt(0)}
                          </div>
                          {p.nama}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{p.wilayah || '-'}</td>
                        <td className="px-6 py-4 font-bold">{p.total_penindakan || 0}</td>
                        <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-400">Data petugas tidak ditemukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t text-sm text-gray-500">
              Menampilkan {filteredPetugas.length} dari {petugasList.length} petugas
            </div>
          </div>
        </>
      )}
    </LayoutAdmin>
  );
}

/* =========================================================
   LAYOUT ADMIN (Sesuai permintaan Anda)
========================================================= */

function LayoutAdmin({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center"><span className="text-white font-black text-sm">A</span></div>
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
            <SidebarItem icon="📊" label="Dashboard" onClick={() => navigate('/internal/admin')} />
            <SidebarItem icon="📋" label="Laporan Masuk" onClick={() => navigate('/internal/admin/laporan')} />
            <SidebarItem icon="📈" label="Penilaian Masyarakat" onClick={() => navigate('/internal/admin/penilaian')} />
            <SidebarItem icon="⚙️" label="Manajemen Petugas" active onClick={() => navigate('/internal/admin/petugas')} />
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

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center">
        <div><div className="text-xs font-bold text-gray-400 mb-1">{title}</div><div className="text-2xl font-bold">{value}</div></div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = { Aktif: 'bg-green-100 text-green-700', Istirahat: 'bg-yellow-100 text-yellow-700', Off: 'bg-gray-100 text-gray-600', Penugasan: 'bg-blue-100 text-blue-700', Tersedia: 'bg-emerald-100 text-emerald-700' };
  const displayStatus = status || 'Off';
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[displayStatus] || styles['Off']}`}>• {displayStatus}</span>;
}