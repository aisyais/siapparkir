import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  History,
  PlusCircle,
  LogOut
} from 'lucide-react';

export default function MasyarakatLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper untuk menentukan apakah menu aktif
  const isActive = (path) => location.pathname === path || (path !== '/lapor' && location.pathname.includes(path));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#001A57] rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">SiapParkir</h1>
            <p className="text-xs text-gray-400 mt-0.5">Portal Masyarakat</p>
          </div>
        </div>
      </header>

      {/* CONTENT WRAPPER */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="hidden md:flex w-75 bg-blue-950 flex-col">
          
          {/* PROFILE SIDEBAR */}
          <div className="px-3 py-4 border-b border-blue-900">
            <div className="w-full flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 text-left">
              <div className="w-10 h-10 flex-shrink-0 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                👤
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Masyarakat</div>
                <div className="text-sm font-bold text-white truncate">User Pengguna</div>
              </div>
            </div>
          </div>

          {/* MENU */}
          <div className="space-y-1 flex-1 p-4">
            <button
              onClick={() => navigate('/lapor')}
              className="w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl text-sm font-semibold transition-all bg-white/10 border border-white/30 text-white hover:bg-blue-600 hover:border-blue-500 shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            >
              <PlusCircle size={16} />
              <span>Laporan Baru</span>
            </button>

            <SidebarItem
              icon={<LayoutDashboard size={16} />}
              label="Dashboard"
              active={isActive('/dashboard')}
              onClick={() => navigate('/dashboard')}
            />
            <SidebarItem
              icon={<ClipboardList size={16} />}
              label="Laporan Masuk"
              active={isActive('/lapor')}
              onClick={() => navigate('/lapor')}
            />
            <SidebarItem
              icon={<History size={16} />}
              label="Riwayat Laporan"
              active={isActive('/riwayat')}
              onClick={() => navigate('/riwayat')}
            />
          </div>

          {/* LOGOUT */}
          <div className="p-4 border-t border-blue-900">
            <button 
              onClick={() => navigate('/')} 
              className="w-full flex items-center justify-center gap-2 text-blue-200 text-sm font-semibold py-2.5 rounded-xl border border-blue-800 transition-all duration-200 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

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