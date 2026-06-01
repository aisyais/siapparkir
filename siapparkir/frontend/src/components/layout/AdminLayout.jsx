import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

function SidebarItem({ icon, label, onClick, active }) {
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

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);

  const [admin, setAdmin] = useState({
    nama: 'Administrator',
    foto: '/avatar-admin.jpg',
  });

  // =========================
  // FETCH PROFIL ADMIN
  // =========================
  useEffect(() => {
    const fetchProfil = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          'http://localhost:3000/api/admin/profil',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data?.data;

        setAdmin({
          nama: data?.nama || 'Administrator',
          foto: data?.foto_profil
            ? `http://localhost:3000/uploads/${data.foto_profil}`
            : '/avatar-admin.jpg',
        });
      } catch (err) {
        console.error('Gagal memuat profil admin:', err);
      }
    };

    fetchProfil();
  }, [token]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center text-white font-black text-sm">
            A
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">
              Admin Dishub
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Sistem Verifikasi Laporan
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/internal/admin/profil')}>
          <img
            src={admin.foto}
            alt="Admin"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
            onError={(e) => {
              e.target.src = '/avatar-admin.jpg';
            }}
          />
        </button>
      </header>

      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="hidden md:flex w-75 bg-blue-950 flex-col">

          {/* PROFILE SIDEBAR */}
          <div
            onClick={() => navigate('/internal/admin/profil')}
            className="px-5 py-5 border-b border-blue-900 cursor-pointer hover:bg-blue-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <img
                src={admin.foto}
                className="w-10 h-10 rounded-full object-cover border border-white/20"
                onError={(e) => {
                  e.target.src = '/avatar-admin.jpg';
                }}
              />

              <div>
                <h2 className="text-white font-bold text-sm">
                  {admin.nama}
                </h2>
                <p className="text-blue-300 text-xs">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="space-y-1 flex-1 p-4">
            <SidebarItem
              icon="📊"
              label="Dashboard"
              active={isActive('/internal/admin')}
              onClick={() => navigate('/internal/admin')}
            />
            <SidebarItem
              icon="📋"
              label="Laporan Masuk"
              active={isActive('/internal/admin/laporan')}
              onClick={() => navigate('/internal/admin/laporan')}
            />
            <SidebarItem
              icon="📈"
              label="Penilaian Masyarakat"
              active={isActive('/internal/admin/penilaian')}
              onClick={() => navigate('/internal/admin/penilaian')}
            />
            <SidebarItem
              icon="⚙️"
              label="Manajemen Petugas"
              active={isActive('/internal/admin/petugas')}
              onClick={() => navigate('/internal/admin/petugas')}
            />
          </div>

          {/* LOGOUT */}
          <div className="p-4 border-t border-blue-900">
            <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 text-blue-200 text-sm font-semibold py-2.5 rounded-xl border border-blue-800 transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:-translate-y-0.5 active:scale-95">← Keluar</button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}