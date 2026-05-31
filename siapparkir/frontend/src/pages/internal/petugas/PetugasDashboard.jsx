import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  LogOut, 
  User, 
  MapPin, 
  Map, 
  ClipboardCheck 
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';

export default function PetugasDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporan();
  }, []);

  // Di PetugasDashboard.jsx, ubah bagian fetchLaporan:
  const fetchLaporan = async () => {
    try {
      setLoading(true);
      // GANTI URL INI sesuai dengan rute backend yang mengarah ke getDashboard
      const res = await axios.get('http://localhost:3000/api/petugas/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("ISI RESPONS DASHBOARD:", res.data); 
      if (res.data?.data?.tugas_aktif?.length > 0) {
        console.log("DATA PERTAMA:", res.data.data.tugas_aktif[0]);
      }
      
      // Karena backend getDashboard mengirim { tugas_aktif: [...] }
      setLaporan(Array.isArray(res.data.data.tugas_aktif) ? res.data.data.tugas_aktif : []);
      
    } catch (err) {
      console.error("Error detail:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* HEADER UTAMA */}
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
        <button onClick={() => navigate('/internal/petugas/profil')}>
           <img src="/avatar-petugas.jpg" alt="Petugas" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
        </button>
      </header>

      <div className="flex flex-1">
        {/* SIDEBAR ASLI ANDA */}
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
              <SidebarItem icon={<LayoutDashboard size={16}/>} label="Daftar Tugas" active />
              <SidebarItem icon={<ClipboardList size={16}/>} label="Laporan Masuk" onClick={() => navigate('/internal/petugas/laporan')} />              
            </nav>
          </div>
          <div className="pt-6 border-t border-white/10">
            <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-red-300 hover:bg-red-500/10 transition-all">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT (STRUKTUR HTML ANDA) */}
        <main className="flex-1 p-6 sm:p-10 transition-all overflow-y-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-serif mb-2">Daftar Tugas Lapangan</h1>
            <p className="text-gray-500 text-sm max-w-2xl leading-relaxed">
              Menampilkan laporan pelanggaran parkir terdekat yang memerlukan penindakan.
            </p>
          </header>

          <div className="mb-6">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Daftar Penindakan Tertunda</div>
            <h2 className="text-base font-bold text-gray-800 tracking-tight">Antrean Tugas Aktif</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Memuat antrean tugas...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {/* Ganti bagian map di dalam PetugasDashboard.jsx menjadi ini: */}
              {laporan.map((item) => (
                <div key={item.id_penugasan} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="relative h-48 sm:h-52 w-full bg-gray-100">
                    {/* Menggunakan item.Laporan.foto_bukti */}
                    <img src={`http://localhost:3000/storage/${item.Laporan.foto_bukti}`} alt="Bukti" className="w-full h-full object-cover" />
                    
                    <span className={`absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md flex items-center gap-1 shadow-sm ${item.Laporan.prioritas === 'tinggi' ? 'bg-[#C21A1A] text-white' : 'bg-[#BCE3FF] text-[#001A57]'}`}>
                      {item.Laporan.prioritas === 'tinggi' ? '🚨 Prioritas Tinggi' : '⏳ Menunggu Penindakan'}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="mb-5">
                      {/* Menggunakan item.Laporan.nomor_plat */}
                      <h3 className="text-lg font-bold text-[#001A57] tracking-tight mb-2">{item.Laporan.nomor_plat}</h3>
                      
                      <div className="flex items-start gap-2 text-sm text-gray-500 leading-relaxed">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        {/* Menggunakan item.Laporan.alamat */}
                        <span>{item.Laporan.alamat}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Tombol Buka Tugas */}
                      <button 
                        onClick={() => navigate(`/internal/petugas/detail-penindakan/${item.id_penugasan}`)}
                        className="flex-1 bg-[#001A57] hover:bg-[#00133f] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <ClipboardCheck size={16} /> Buka Tugas
                      </button>

                      {/* Tombol Akses Map */}
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${item.Laporan.latitude},${item.Laporan.longitude}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-[#001A57] px-4 rounded-xl flex items-center justify-center transition-all shadow-sm"
                        title="Lihat di Maps"
                      >
                        <Map size={20} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${active ? 'bg-[#BCE3FF] text-[#001A57]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}