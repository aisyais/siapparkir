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

      const res = await axios.get(
        'http://localhost:3000/api/admin/petugas',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payload = res.data?.data || {};
      const data = Array.isArray(payload.data)
        ? payload.data
        : [];

      setPetugasList(data);
      setFilteredPetugas(data);

      setStatistik({
        total: payload.statistik?.total || 0,
        aktif: payload.statistik?.aktif || 0,
        dalam_penugasan:
          payload.statistik?.dalam_penugasan || 0,
        tersedia: payload.statistik?.tersedia || 0,
      });
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPetugas();
    }
  }, [token]);

  // ✅ Filter search dipisah dari fetch
  useEffect(() => {
    if (!search.trim()) {
      setFilteredPetugas(petugasList)
      return
    }
    const keyword = search.toLowerCase()
    setFilteredPetugas(
      petugasList.filter((p) =>
        p.kode_user?.toLowerCase().includes(keyword) ||
        p.nama?.toLowerCase().includes(keyword)      ||
        p.nip?.toLowerCase().includes(keyword)
      )
    )
  }, [search, petugasList])

  return (
    <LayoutAdmin>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Manajemen Petugas Lapangan
      </h2>

      {loading ? (
        <div className="bg-white p-10 rounded-2xl border text-center text-gray-400">
          ⏳ Memuat data petugas...
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="TOTAL PETUGAS"    value={statistik.total}           icon="🏢" />
            <StatCard title="PETUGAS AKTIF"    value={statistik.aktif}           icon="👤" />
            <StatCard title="DALAM PENUGASAN"  value={statistik.dalam_penugasan} icon="🚓" />
            <StatCard title="TERSEDIA"         value={statistik.tersedia}        icon="📅" />
          </div>

          {/* SEARCH + TAMBAH */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Cari ID, nama, atau NIP petugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => navigate('/internal/admin/tambah_petugas')}
              className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition text-sm"
            >
              + Tambah Petugas
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
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
                    filteredPetugas.map((p) => (
                      <tr
                        key={p.id_user}
                        className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => navigate(`/internal/admin/petugas/${p.id_user}`)}
                      >
                        {/* ID */}
                        <td className="px-6 py-4 font-mono font-medium text-blue-900">
                          #{p.kode_user || p.id_user}
                        </td>

                        {/* Nama */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-900 text-xs flex-shrink-0">
                              {p.foto_profil ? (
                                <img
                                  src={`http://localhost:3000/uploads/${p.foto_profil}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                  alt={p.nama}
                                />
                              ) : (
                                p.nama?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{p.nama}</p>
                              <p className="text-xs text-gray-400">{p.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Wilayah */}
                        <td className="px-6 py-4 text-gray-600">
                          {p.wilayah?.nama_wilayah || '-'}
                        </td>

                        {/* Penindakan */}
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {p.jumlah_penindakan || 0}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <StatusBadge status={p.status_petugas} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-gray-400">
                        <div className="text-3xl mb-2">👮</div>
                        <p className="font-medium">Tidak ada petugas ditemukan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            {filteredPetugas.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
                Menampilkan {filteredPetugas.length} dari {statistik.total} petugas
              </div>
            )}
          </div>
        </>
      )}
    </LayoutAdmin>
  )
}

// ============================================================
// KOMPONEN PENDUKUNG
// ============================================================

function StatusBadge({ status }) {
  const styles = {
    aktif:    'bg-green-100 text-green-700',
    istirahat: 'bg-yellow-100 text-yellow-700',
    off:      'bg-gray-100 text-gray-600',
  }
  const labels = {
    aktif:    'Aktif',
    istirahat: 'Istirahat',
    off:      'Off',
  }
  const s = status || 'off'
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[s] || styles.off}`}>
      • {labels[s] || s}
    </span>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs font-bold text-gray-400 mb-1">{title}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

function LayoutAdmin({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">Admin Dishub</h1>
            <p className="text-xs text-gray-400 mt-0.5">Sistem Verifikasi Laporan</p>
          </div>
        </div>
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
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white text-lg">🛡️</div>
              <div><h2 className="text-white font-bold text-sm">Administrator</h2><p className="text-blue-300 text-xs">Dishub Kota</p></div>
            </div>
          </div>
          <div className="space-y-1 flex-1 p-4">
            <SidebarItem icon="📊" label="Dashboard"          onClick={() => navigate('/internal/admin')} />
            <SidebarItem icon="📋" label="Laporan Masuk"      onClick={() => navigate('/internal/admin/laporan')} />
            <SidebarItem icon="📈" label="Penilaian Masyarakat" onClick={() => navigate('/internal/admin/penilaian')} />
            <SidebarItem icon="⚙️" label="Manajemen Petugas"  onClick={() => navigate('/internal/admin/petugas')} active />
          </div>
          <div className="p-4 border-t border-blue-900">
            <button
              onClick={() => navigate('/')}
              className="w-full text-blue-300 hover:text-white text-sm py-2 transition"
            >
              ← Keluar
            </button>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        active ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-900 hover:text-white'
      }`}
    >
      <span>{icon}</span><span>{label}</span>
    </button>
  )
}