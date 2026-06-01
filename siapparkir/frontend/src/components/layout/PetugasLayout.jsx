import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  ClipboardList,
  LogOut,
  History
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function PetugasLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);

  const [petugas, setPetugas] = useState({ nama: 'Petugas', foto: '/avatar-petugas.jpg' });

  useEffect(() => {
    const fetchProfil = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:3000/api/petugas/profil', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.data) {
          const { nama, foto_profil } = res.data.data;
          setPetugas({
            nama: nama || 'Petugas',
            foto: foto_profil ? `http://localhost:3000/uploads/${foto_profil}` : '/avatar-petugas.jpg'
          });
        }
      } catch (err) {
        console.error("Gagal load profil petugas", err);
      }
    };

    fetchProfil();
  }, [token]);

  const pathname = location.pathname;
  const isDaftarTugasActive = pathname === '/internal/petugas' || pathname.startsWith('/internal/petugas/detail-penindakan/') || pathname === '/internal/petugas/selesai';
  const isLaporanActive = pathname === '/internal/petugas/laporan';
  const isRiwayatActive = pathname === '/internal/petugas/riwayat';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      
      {/* HEADER (Paling Atas - Full Width) */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#001A57] rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">SiapParkir</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dashboard Petugas Lapangan</p>
          </div>
        </div>
      </header>

      {/* CONTAINER DI BAWAH HEADER */}
      <div className="flex flex-1">
        
        {/* SIDEBAR */}
        <aside className="hidden md:flex w-75 bg-[#001A57] text-white flex-col justify-between p-6 shadow-xl flex-shrink-0">
          <div className="space-y-8">
            <button
              onClick={() => navigate('/internal/petugas/profil')}
              className="w-full flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/20">
                <img src={petugas.foto} alt="Profil" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Petugas</div>
                <div className="text-sm font-bold tracking-wide truncate max-w-[120px]">{petugas.nama}</div>
              </div>
            </button>

            <nav className="space-y-1.5">
              <SidebarItem icon={<LayoutDashboard size={16} />} label="Daftar Tugas" active={isDaftarTugasActive} onClick={() => navigate('/internal/petugas')} />
              <SidebarItem icon={<ClipboardList size={16} />} label="Laporan Masuk" active={isLaporanActive} onClick={() => navigate('/internal/petugas/laporan')} />
              <SidebarItem icon={<History size={16} />} label="Riwayat Penindakan" active={isRiwayatActive} onClick={() => navigate('/internal/petugas/riwayat')} />
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-3 px-6 py-4 text-sm font-bold uppercase tracking-wider rounded-2xl text-red-400 hover:bg-red-500/20 hover:text-red-100 transition-all w-full border border-red-500/10"
            >
              <LogOut size={18} /> Keluar
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-6 sm:p-10 transition-all overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
        active
          ? 'bg-[#BCE3FF] text-[#001A57]'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon} {label}
    </button>
  );
}