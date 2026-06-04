import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

const TINDAKAN_LABEL = {
  teguran: 'Teguran',
  gembok: 'Gembok Ban',
  derek: 'Derek',
  pindah: 'Pindah',
  tidak_ditemukan: 'Tidak Ditemukan',
};

const TINDAKAN_STYLE = {
  teguran: 'bg-gray-100 text-gray-600',
  gembok: 'bg-orange-100 text-orange-700',
  derek: 'bg-red-100 text-red-700',
  pindah: 'bg-blue-100 text-blue-700',
  tidak_ditemukan: 'bg-purple-100 text-purple-700',
};

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function RiwayatPenindakan() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, teguran: 0, gembok: 0, derek: 0 });

  useEffect(() => {
    let isMounted = true;

    const fetchRiwayat = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          'http://localhost:3000/api/petugas/tugas?status_penugasan=selesai&limit=100',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!isMounted) return;

        const data = Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
        setRiwayat(data);

        // Menggunakan reduce agar lebih efisien (hanya 1x iterasi data)
        const stats = data.reduce((acc, item) => {
          const tindakan = item.Laporan?.tindakan?.[0]?.jenis_tindakan;
          if (tindakan === 'teguran') acc.teguran++;
          else if (tindakan === 'gembok') acc.gembok++;
          else if (tindakan === 'derek') acc.derek++;
          return acc;
        }, { total: data.length, teguran: 0, gembok: 0, derek: 0 });

        setStats(stats);
        
      } catch (err) {
        console.error('Gagal memuat riwayat:', err);
        // Optional: tambahkan Swal.fire untuk feedback ke user
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (token) fetchRiwayat();
    return () => { isMounted = false; };
  }, [token]);

  return (
    <div className="space-y-8">
      {/* TITLE SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 rounded-3xl p-8 shadow-sm mb-8">
        <div className="absolute right-0 top-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>

        <div className="relative">
          <span className="text-blue-200 text-xs uppercase tracking-[0.25em] font-bold">
            Sistem SiapParkir
          </span>

          <h1 className="text-4xl font-extrabold text-white mt-2">
            Riwayat Penindakan
          </h1>

          <p className="text-blue-100 mt-3 max-w-2xl text-sm leading-relaxed">
            Tinjau seluruh tugas dan tindakan yang telah diselesaikan sebagai
            dokumentasi kinerja serta rekam jejak penanganan pelanggaran parkir.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Selesai" value={stats.total} icon="✅" color="text-gray-900" />
        <StatCard label="Teguran" value={stats.teguran} icon="📢" color="text-gray-700" />
        <StatCard label="Gembok" value={stats.gembok} icon="🔒" color="text-orange-600" />
        <StatCard label="Derek" value={stats.derek} icon="🚚" color="text-red-600" />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">⏳ Memuat riwayat...</div>
      ) : riwayat.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-semibold text-gray-600">Belum ada riwayat penindakan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">ID Laporan</th>
                <th className="px-6 py-4 text-left">Nomor Plat</th>
                <th className="px-6 py-4 text-left">Lokasi</th>
                <th className="px-6 py-4 text-left">Tindakan</th>
                <th className="px-6 py-4 text-left">Foto Bukti</th>
                <th className="px-6 py-4 text-left">Waktu Selesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {riwayat.map((item) => {
                const lap = item.Laporan || {};
                const tindakan = lap.tindakan?.[0] || {};
                return (
                  <tr key={item.id_penugasan} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(`/internal/petugas/detail-penindakan/${item.id_penugasan}`)}>
                    <td className="px-6 py-4 font-bold text-[#001A57]">#{lap.kode_laporan || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-900 text-white px-2 py-1 rounded text-[11px] font-bold font-mono">{lap.nomor_plat || '-'}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-gray-700 text-xs truncate">{lap.alamat || '-'}</td>
                    <td className="px-6 py-4">
                      {tindakan.jenis_tindakan ? (
                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${TINDAKAN_STYLE[tindakan.jenis_tindakan] || 'bg-gray-100'}`}>
                          {TINDAKAN_LABEL[tindakan.jenis_tindakan] || tindakan.jenis_tindakan}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {tindakan.foto_tindakan ? (
                        <img src={`http://localhost:3000/uploads/${tindakan.foto_tindakan}`} alt="Bukti" className="w-14 h-10 object-cover rounded-lg" />
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{formatTanggal(tindakan.waktu_selesai || item.waktu_penugasan)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}