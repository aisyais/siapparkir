import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';
import { Clock, AlertTriangle, FileText, MapPin, AlignLeft, Tag } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminLaporan() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  const selectedId = location.state?.selectedId;

  const [laporan, setLaporan] = useState([]);
  const [statistik, setStatistik] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLaporan, setSelectedLaporan] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [laporanRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/laporan?status=menunggu_verifikasi', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:3000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const laporanData = Array.isArray(laporanRes.data?.data?.data) ? laporanRes.data.data.data : [];
      setLaporan(laporanData);
      setStatistik(statsRes.data?.data?.statistik || {});

      if (laporanData.length > 0) {
        const found = selectedId ? laporanData.find(l => l.id_laporan === selectedId) : laporanData[0];
        setSelectedLaporan(found || laporanData[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedId]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#001A57] to-[#00308F] p-8 md:p-10 text-white shadow-lg">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[180px] font-black opacity-5 select-none">
            REPORT
          </div>
          <div className="relative z-10 w-full">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider">
              Manajemen Laporan
            </span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight">
              Verifikasi Laporan
            </h2>
            <p className="mt-3 text-blue-100 text-sm leading-relaxed max-w-5xl">
              Tinjau laporan yang dikirim masyarakat, lakukan validasi bukti pelanggaran,
              tentukan prioritas penanganan, dan distribusikan tugas kepada petugas
              lapangan secara terstruktur untuk memastikan setiap laporan diproses secara
              cepat, tepat, dan terdokumentasi dengan baik.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/internal/admin/laporan_penindakan')}
          className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg flex items-center gap-2"
        >
          <FileText size={18} /> Riwayat Penindakan
        </button>
      </div>

      {loading ? (
        <div className="text-center p-20 text-gray-400">Memuat data...</div>
      ) : laporan.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-dashed text-center shadow-sm">
          <h3 className="text-xl font-bold text-gray-800">Semua laporan telah diproses!</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <StatCard title="Menunggu" value={statistik.antrean_verifikasi || laporan.length} icon={<Clock size={20}/>} />
               <StatCard title="Prioritas" value={statistik.prioritas_tinggi || 0} icon={<AlertTriangle size={20}/>} />
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden h-[450px] flex flex-col">
              <div className="p-6 border-b border-gray-50 font-bold text-gray-800">Daftar Laporan</div>
              <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {laporan.map((l) => (
                  <button key={l.id_laporan} onClick={() => setSelectedLaporan(l)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${selectedLaporan?.id_laporan === l.id_laporan ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                    <p className="font-bold text-sm text-gray-900">{l.kode_laporan}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{l.alamat}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            {selectedLaporan && <DetailLaporanCard laporan={selectedLaporan} token={token} />}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
      </div>
      <div className="text-blue-600 p-2 bg-blue-50 rounded-xl">{icon}</div>
    </div>
  );
}

function DetailLaporanCard({ laporan, token }) {
  const [tindakan, setTindakan] = useState('setujui');
  const [petugasList, setPetugasList] = useState([]);
  const [petugas, setPetugas] = useState('');
  const [alasanTolak, setAlasanTolak] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/api/admin/petugas?status=aktif', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setPetugasList(res.data?.data?.data || []));
  }, [token]);

  const handleAction = async () => {
    try {
      if (tindakan === 'setujui') {
        await axios.post(`http://localhost:3000/api/admin/laporan/${laporan.id_laporan}/tugaskan`, 
          { id_petugas: petugas, tindakan_direkomendasikan: 'tindak_lanjut', catatan_tugas: 'Segera tangani', batas_waktu_penanganan: new Date().toISOString() }, 
          { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.put(`http://localhost:3000/api/admin/laporan/${laporan.id_laporan}/tolak`, 
          { alasan_penolakan: alasanTolak }, 
          { headers: { Authorization: `Bearer ${token}` } });
      }

      // Alert Cantik Sukses
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Aksi telah diproses dengan sukses.',
        confirmButtonColor: '#1d4ed8', // Biru Tailwind (blue-700)
        timer: 2000
      });
      
      window.location.reload();
    } catch (err) {
      // Alert Cantik Error
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Gagal memproses aksi. Silakan coba lagi.',
        confirmButtonColor: '#dc2626' // Merah Tailwind
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h3 className="text-3xl font-extrabold text-gray-900">{laporan.kode_laporan}</h3>
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">SLA Urgent</span>
        </div>
        <p className="text-sm text-gray-400 font-medium">{new Date(laporan.created_at).toLocaleDateString('id-ID')}</p>
      </div>

      {laporan.foto_bukti && (
        <img src={`http://localhost:3000/uploads/${laporan.foto_bukti}`} alt="Bukti" className="w-full h-72 object-cover rounded-2xl shadow-inner" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3"><MapPin size={14}/> Lokasi</h4>
           <p className="text-sm font-medium bg-gray-50 p-4 rounded-xl text-gray-700">{laporan.alamat}</p>
        </div>
        <div>
          <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            <Tag size={14}/> Kategori
          </h4>
          <p className="text-sm font-medium bg-blue-50 p-4 rounded-xl text-blue-900">
            {laporan.kategori?.nama_kategori || laporan.KategoriPelanggaran?.nama_kategori || 'Kategori tidak diketahui'}
          </p>
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3"><AlignLeft size={14}/> Deskripsi</h4>
        <p className="text-sm font-medium bg-gray-50 p-4 rounded-xl text-gray-700">{laporan.deskripsi}</p>
      </div>

      <div className="border-t pt-8">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTindakan('setujui')} className={`flex-1 py-4 rounded-2xl font-bold transition-all ${tindakan === 'setujui' ? 'bg-blue-950 text-white shadow-lg' : 'bg-gray-100 text-gray-600'}`}>Setujui & Tugaskan</button>
          <button onClick={() => setTindakan('tolak')} className={`flex-1 py-4 rounded-2xl font-bold transition-all ${tindakan === 'tolak' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>Tolak Laporan</button>
        </div>
        
        {tindakan === 'setujui' ? (
           <select className="w-full p-4 border border-gray-200 rounded-2xl mb-4 text-sm font-medium" onChange={(e) => setPetugas(e.target.value)} value={petugas}>
             <option value="">Pilih Petugas Lapangan...</option>
             {petugasList.map(p => <option key={p.id_user} value={p.id_user}>{p.nama} ({p.unit})</option>)}
           </select>
        ) : (
           <div>
             <div className="grid grid-cols-2 gap-2 mb-3">
               {['Foto Kurang Jelas', 'Bukan Pelanggaran', 'Laporan Duplikat'].map((alasan) => (
                 <button key={alasan} type="button" onClick={() => setAlasanTolak(alasan)} className={`text-xs p-3 rounded-xl border ${alasanTolak === alasan ? 'bg-red-100 border-red-500' : 'border-gray-200'}`}>
                   {alasan}
                 </button>
               ))}
             </div>
             <textarea className="w-full p-4 border border-gray-200 rounded-2xl mb-4 text-sm" placeholder="Atau ketik catatan khusus penolakan..." value={alasanTolak} onChange={(e) => setAlasanTolak(e.target.value)} />
           </div>
        )}

        <button onClick={handleAction} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
          {tindakan === 'setujui' ? 'Konfirmasi Penugasan' : 'Konfirmasi Penolakan'}
        </button>
      </div>
    </div>
  );
}