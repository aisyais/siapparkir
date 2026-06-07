import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  History,
  X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-blue-800 text-white'
          : 'text-blue-300 hover:bg-blue-900 hover:text-white'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function PetugasLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [petugas, setPetugas] = useState({
    nama: 'Petugas',
    foto: '/avatar-petugas.jpg'
  });

  useEffect(() => {
    const fetchProfil = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          'http://localhost:3000/api/petugas/profil',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = res.data?.data;

        setPetugas({
          nama: data?.nama || 'Petugas',
          foto: data?.foto_profil
            ? `http://localhost:3000/uploads/${data.foto_profil}`
            : '/avatar-petugas.jpg'
        });
      } catch (err) {
        console.error('Gagal memuat profil petugas:', err);
      }
    };

    fetchProfil();
  }, [token]);

  const pathname = location.pathname;

  const isDaftarTugasActive =
    pathname === '/internal/petugas' ||
    pathname === '/internal/petugas/selesai';

  const isLaporanActive =
    pathname === '/internal/petugas/laporan';

  const isRiwayatActive =
    pathname === '/internal/petugas/riwayat';

  const goTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">

      {/* HEADER */}
      <header className="h-[73px] flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-30">

        <div className="flex items-center gap-3">

          {/* LOGO P - KLIK UNTUK BUKA SIDEBAR DI HP */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 bg-[#001A57] rounded-xl flex items-center justify-center md:cursor-default"
          >
            <span className="text-white font-black text-sm">
              P
            </span>
          </button>

          <div>
            <h1 className="font-bold text-gray-800 leading-none">
              SiapParkir
            </h1>

            <p className="text-xs text-gray-400 mt-0.5">
              Dashboard Petugas Lapangan
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/internal/petugas/profil')}>
          <img
            src={petugas.foto}
            alt="Petugas"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
            onError={(e) => {
              e.target.src = '/avatar-petugas.jpg';
            }}
          />
        </button>

      </header>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside
          className={`
            fixed md:sticky md:top-0 top-0 left-0 z-50 h-screen md:h-full w-72 bg-blue-950 flex flex-col
            transform transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
          `}
        >

          {/* CLOSE BUTTON MOBILE */}
          <div className="md:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white"
            >
              <X size={22} />
            </button>
          </div>

          {/* PROFILE SIDEBAR */}
          <div className="px-3 py-4 border-b border-blue-900">
            <button
              onClick={() => goTo('/internal/petugas/profil')}
              className="w-full flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-left overflow-hidden"
            >
              <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-white/20">
                <img
                  src={petugas.foto}
                  alt="Petugas"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/avatar-petugas.jpg';
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                  Petugas
                </div>

                <div className="text-sm font-bold text-white truncate">
                  {petugas.nama}
                </div>
              </div>
            </button>
          </div>

          {/* MENU */}
          <div className="space-y-1 flex-1 p-4">

            <SidebarItem
              icon={<LayoutDashboard size={16} />}
              label="Daftar Tugas"
              active={isDaftarTugasActive}
              onClick={() => goTo('/internal/petugas')}
            />

            <SidebarItem
              icon={<ClipboardList size={16} />}
              label="Laporan Masuk"
              active={isLaporanActive}
              onClick={() => goTo('/internal/petugas/laporan')}
            />

            <SidebarItem
              icon={<History size={16} />}
              label="Riwayat Penindakan"
              active={isRiwayatActive}
              onClick={() => goTo('/internal/petugas/riwayat')}
            />

          </div>

          {/* LOGOUT */}
          <div className="p-4 border-t border-blue-900">
            <button
              onClick={() => goTo('/')}
              className="w-full flex items-center justify-center gap-2 text-blue-200 text-sm font-semibold py-2.5 rounded-xl border border-blue-800 transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>

        </aside>

        {/* CONTENT */}
        <main className="flex-1 h-full p-4 md:p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}