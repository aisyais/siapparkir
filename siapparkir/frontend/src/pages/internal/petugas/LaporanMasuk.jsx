import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  LogOut,
  User,
  Search,
  Filter
} from 'lucide-react';

import useAuthStore from '../../../store/authStore';

export default function LaporanMasuk() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [laporan, setLaporan] = useState([]);
  const [filteredLaporan, setFilteredLaporan] = useState([]);
  const [search, setSearch] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    belum: 0,
    duplikat: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  useEffect(() => {
    handleSearch();
  }, [search, laporan]);

  const fetchData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        'http://localhost:3000/api/petugas/laporan-masuk',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(res.data);

      const data = Array.isArray(res.data.data)
        ? res.data.data
        : [];

      setLaporan(data);
      setFilteredLaporan(data);

      setStats({
        total: data.length,
        belum: data.filter(
          (item) =>
            item.status === 'Pending' ||
            item.status === 'Belum Diverifikasi'
        ).length,
        duplikat: data.filter(
          (item) => item.status === 'Duplikat'
        ).length
      });
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const keyword = search.toLowerCase();

    const filtered = laporan.filter((item) => {
      const id = String(item.id_laporan || '').toLowerCase();
      const lokasi = String(item.lokasi || '').toLowerCase();

      return (
        id.includes(keyword) ||
        lokasi.includes(keyword)
      );
    });

    setFilteredLaporan(filtered);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* HEADER */}
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
              Laporan Masuk Petugas Lapangan
            </p>
          </div>

        </div>

        <button onClick={() => navigate('/internal/petugas/profil')}>
          <img
            src="/avatar-petugas.jpg"
            alt="Petugas"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
        </button>

      </header>

      <div className="flex flex-1">

        {/* SIDEBAR */}
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

              <SidebarItem
                icon={<LayoutDashboard size={16} />}
                label="Daftar Tugas"
                onClick={() => navigate('/internal/petugas')}
              />

              <SidebarItem
                icon={<ClipboardList size={16} />}
                label="Laporan Masuk"
                active
              />

            </nav>

          </div>

          <div className="pt-6 border-t border-white/10">

            <button
              onClick={() => navigate('/internal/login')}
              className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-red-300 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={16} />
              Keluar
            </button>

          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 sm:p-10 transition-all overflow-y-auto">

          {/* TITLE */}
          <div className="mb-8">

            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-serif mb-2">
              Antrian Laporan Masuk
            </h1>

            <p className="text-gray-500 text-sm">
              Verifikasi dan tugaskan petugas untuk laporan terbaru.
            </p>

          </div>

          {/* SEARCH */}
          <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 items-center">

            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">

              <Search className="text-gray-400" size={18} />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID Laporan atau Lokasi..."
                className="bg-transparent outline-none text-sm w-full"
              />

            </div>

            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter size={16} />
              Filter
            </button>

          </div>

          {/* STAT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <StatCard
              label="TOTAL ANTRIAN"
              value={stats.total}
            />

            <StatCard
              label="BELUM DIVERIFIKASI"
              value={stats.belum}
            />

            <StatCard
              label="INDIKASI DUPLIKAT"
              value={stats.duplikat}
            />

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

            <table className="w-full text-left text-sm">

              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">

                <tr>

                  <th className="px-6 py-4">
                    ID LAPORAN
                  </th>

                  <th className="px-6 py-4">
                    FOTO BUKTI
                  </th>

                  <th className="px-6 py-4">
                    WAKTU LAPORAN
                  </th>

                  <th className="px-6 py-4">
                    LOKASI
                  </th>

                  <th className="px-6 py-4">
                    STATUS
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10"
                    >
                      Memuat data dari database...
                    </td>
                  </tr>
                ) : filteredLaporan.length > 0 ? (
                    filteredLaporan.map((item) => (
                        <tr
                        key={item.id_laporan}
                        onClick={() => navigate(`/internal/petugas/detail-penindakan/${item.id_laporan}`)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                        <td className="px-6 py-4 font-bold text-[#001A57]">
                            {item.id_laporan}
                        </td>
                        <td className="px-6 py-4">
                            <img
                            src={`http://localhost:3000/uploads/${item.foto}`}
                            alt="Bukti"
                            className="w-16 h-10 object-cover rounded-md"
                            />
                        </td>
                        <td className="px-6 py-4">
                            {item.waktu
                            ? new Date(item.waktu).toLocaleDateString('id-ID')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 font-medium">
                            {item.lokasi}
                        </td>
                        <td className="px-6 py-4">
                            <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                                item.status === 'Pending'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-green-50 text-green-600'
                            }`}
                            >
                            ● {item.status}
                            </span>
                        </td>
                        </tr>
                    ))
                    ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-10"
                    >
                      Tidak ada laporan masuk.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </main>

      </div>

    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  label,
  active,
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
        active
          ? 'bg-[#BCE3FF] text-[#001A57]'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">

      <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">
        {label}
      </div>

      <div className="text-2xl font-black text-gray-900">
        {value}
      </div>

    </div>
  );
}