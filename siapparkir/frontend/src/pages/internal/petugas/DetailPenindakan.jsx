import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, ClipboardList, Users, LogOut, User, ArrowLeft, 
  MapPin, Camera, Truck, Megaphone, Lock, Move, AlertCircle, CheckCircle 
} from 'lucide-react';
import useAuthStore from '../../../store/authStore';

export default function DetailPenindakan() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL
  const token = useAuthStore((s) => s.token);
  
  const [dataLaporan, setDataLaporan] = useState(null);
  const [tindakan, setTindakan] = useState('DEREK PAKSA');
  const [catatan, setCatatan] = useState('');
  const [fotoBukti, setFotoBukti] = useState(null);

  const [dataTugas, setDataTugas] = useState(null); // Data penugasan + laporan
  const [loading, setLoading] = useState(true);

  // DI DALAM DetailPenindakan.jsx
  useEffect(() => {
    const fetchDetail = async () => {
      // 1. Bersihkan ID jika ternyata berisi karakter sampah ":id}"
      let cleanId = id;
      if (cleanId && cleanId.includes(':')) {
        cleanId = cleanId.replace(/[:}]/g, ''); 
      }

      // 2. Jika setelah dibersihkan hasilnya kosong atau tetap "id", jangan lanjut
      if (!cleanId || cleanId === 'id') {
        console.warn("ID tidak valid, tidak bisa fetch data.");
        return;
      }

      try {
        setLoading(true);
        // Panggil API dengan ID yang sudah pasti bersih
        const res = await axios.get(`http://localhost:3000/api/petugas/tugas/${cleanId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Data Detail Tugas:", res.data.data);
        setDataTugas(res.data.data);
      } catch (err) {
        console.error("Gagal memuat detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, token]);

  const handleSelesaikan = async () => {
    if (!fotoBukti) return alert("Harap unggah foto bukti penindakan!");
    
    // Logika kirim data ke backend
    alert("Tugas berhasil diselesaikan!");
    navigate('/internal/petugas/laporan');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft size={20}/></button>
          <div className="w-8 h-8 bg-[#001A57] rounded-xl flex items-center justify-center text-white font-black text-sm">P</div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">SiapParkir</h1>
            <p className="text-xs text-gray-400 mt-0.5">Detail Penindakan</p>
          </div>
        </div>
        <img src="/avatar-petugas.jpg" alt="Petugas" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
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
                      <SidebarItem icon={<LayoutDashboard size={16}/>} label="Dashboard" onClick={() => navigate('/internal/petugas')} />
                      <SidebarItem icon={<ClipboardList size={16}/>} label="Laporan Masuk" onClick={() => navigate('/internal/petugas/laporan')} />
                      <SidebarItem icon={<Users size={16}/>} label="Petugas Lapangan" onClick={() => navigate('/internal/petugas/tugas')} />
                    </nav>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-red-300 hover:bg-red-500/10 transition-all">
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* TARUH FOTO BUKTI DI SINI */}
            {dataTugas?.Laporan?.foto_bukti && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Bukti Laporan Warga</h2>
                <img 
                  src={`http://localhost:3000/storage/${dataTugas.Laporan.foto_bukti}`} 
                  alt="Bukti Laporan" 
                  className="w-full h-64 object-cover rounded-xl shadow-sm"
                />
              </div>
            )}
            
            {/* Info Pelanggaran */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Informasi Pelanggaran</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Nomor Kendaraan</p>
                  <p className="text-2xl font-black font-mono">{dataTugas?.Laporan?.nomor_plat || '-'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Jenis</p>
                  <p className="text-sm font-bold text-gray-700">{dataTugas?.Laporan?.jenis_pelanggaran || 'Parkir Liar'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                <MapPin size={16} /> {dataTugas?.Laporan?.alamat || 'Alamat tidak tersedia'}
              </div>
            </div>
          </div>

          {/* Kolom Tindakan */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Tindakan Lapangan</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'TEGURAN', icon: <Megaphone size={16}/>, label: 'Teguran' },
                  { id: 'GEMBOK', icon: <Lock size={16}/>, label: 'Gembok' },
                  { id: 'DEREK PAKSA', icon: <Truck size={16}/>, label: 'Derek' },
                  { id: 'PEMINDAHAN', icon: <Move size={16}/>, label: 'Pindah' }
                ].map(opt => (
                  <button 
                    key={opt.id} 
                    onClick={() => setTindakan(opt.id)}
                    className={`p-3 border-2 rounded-xl flex flex-col items-center gap-2 text-xs font-bold transition-all 
                      ${tindakan === opt.id ? 'border-[#001A57] bg-[#001A57]/5 text-[#001A57]' : 'border-gray-200 text-gray-600'}`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Foto Bukti */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-bold text-gray-400 uppercase mb-4">Bukti Tindakan</h2>
              <input type="file" onChange={(e) => setFotoBukti(e.target.files[0])} className="hidden" id="fileInput" />
              <div onClick={() => document.getElementById('fileInput').click()} className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center cursor-pointer hover:bg-gray-50">
                <Camera className="text-gray-400 mb-2" />
                <span className="text-xs font-bold text-gray-500">Unggah Foto</span>
              </div>
            </div>

            <button onClick={handleSelesaikan} className="w-full bg-[#001A57] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
              <CheckCircle size={18}/> Selesaikan Penugasan
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase rounded-xl transition-all ${active ? 'bg-[#BCE3FF] text-[#001A57]' : 'text-gray-300 hover:bg-white/5'}`}>
      {icon} {label}
    </button>
  );
}