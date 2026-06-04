import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Map, ClipboardCheck, AlertCircle, Clock } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import Swal from 'sweetalert2';

export default function PetugasDashboard() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchLaporan();
  }, [token]);

  const fetchLaporan = async () => {
    try {
      setLoading(true);

      const res = await axios.get('http://localhost:3000/api/petugas/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mengambil data dengan aman menggunakan optional chaining
      const tugasAktif = res.data?.data?.tugas_aktif;
      
      // Validasi tipe data sebelum set ke state
      setLaporan(Array.isArray(tugasAktif) ? tugasAktif : []);

    } catch (err) {
      console.error("Gagal memuat dashboard:", err);

      // Memberikan feedback visual yang cantik jika terjadi error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: 'Terjadi kesalahan saat mengambil data dashboard. Silakan coba muat ulang.',
        confirmButtonColor: '#001A57',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-8xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 rounded-3xl p-8 shadow-sm mb-8">
        <div className="absolute right-0 top-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative">
          <span className="text-blue-200 text-xs uppercase tracking-[0.25em] font-bold">
            Sistem SiapParkir
          </span>

          <h1 className="text-4xl font-extrabold text-white mt-2">
            Daftar Tugas Lapangan
          </h1>

          <p className="text-blue-100 mt-3 max-w-2xl text-sm leading-relaxed">
            Pantau laporan yang ditugaskan kepada Anda, lakukan verifikasi di
            lapangan, dan selesaikan proses penindakan secara cepat dan akurat.
          </p>
        </div>
      </div>

      {/* ANTRIAN LIST */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Tugas Menunggu Penindakan</h2>
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{laporan.length} Tugas Baru</span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Memuat data penugasan...</div>
      ) : laporan.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400">Tidak ada tugas aktif saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {laporan.map((item) => (
            <div key={item.id_penugasan} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative h-56 w-full bg-gray-200">
                <img
                  src={`http://localhost:3000/uploads/${item.Laporan?.foto_bukti}`}
                  alt="Bukti"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/no-image.png"; }}
                />
                <div className={`absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg ${item.Laporan.prioritas === 'tinggi' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {item.Laporan.prioritas === 'tinggi' ? <AlertCircle size={14} /> : <Clock size={14} />}
                  {item.Laporan.prioritas === 'tinggi' ? 'Prioritas Tinggi' : 'Menunggu'}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-black text-gray-900 mb-1">{item.Laporan.nomor_plat}</h3>
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{item.Laporan.alamat}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/internal/petugas/detail-penindakan/${item.id_penugasan}`)}
                    className="flex-1 bg-[#001A57] hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <ClipboardCheck size={16} /> Proses Tugas
                  </button>
                  <a 
                    href={`https://maps.google.com/?q=${item.Laporan.latitude},${item.Laporan.longitude}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-14 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <Map size={20} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}