import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function AdminLaporan() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [laporan, setLaporan] = useState([]);
  const [statistik, setStatistik] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLaporan, setSelectedLaporan] = useState(null);

  const fetchData = useCallback(async () => {
  try {
    setLoading(true);

    const laporanRes = await axios.get(
      'http://localhost:3000/api/admin/laporan?status=menunggu_verifikasi',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('RESPON LAPORAN:', laporanRes.data);

    const laporanData = Array.isArray(
      laporanRes.data?.data?.data
    )
      ? laporanRes.data.data.data
      : [];

    console.log('ARRAY LAPORAN:', laporanData);

    setLaporan(laporanData);

    if (laporanData.length > 0) {
      setSelectedLaporan(laporanData[0]);
    } else {
      setSelectedLaporan(null);
    }

    const statsRes = await axios.get(
      'http://localhost:3000/api/admin/dashboard',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setStatistik(
      statsRes.data?.data?.statistik || {}
    );
  } catch (err) {
    console.error(
      'Gagal fetch data:',
      err.response?.data || err
    );
  } finally {
    setLoading(false);
  }
}, [token]);
  useEffect(() => {
  if (!token) return;

  fetchData();
}, [token, fetchData]);
  return (
    <LayoutAdmin>
      {loading ? (
        <div className="bg-white p-10 rounded-2xl border text-center">
          Memuat data...
        </div>
      ) : laporan.length === 0 ? (
        <EmptyState statistik={statistik} navigate={navigate} />
      ) : (
        <LaporanListState
          laporan={laporan}
          selectedLaporan={selectedLaporan}
          onSelectLaporan={setSelectedLaporan}
          statistik={statistik}
        />
      )}
    </LayoutAdmin>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ statistik, navigate }) {
  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Verifikasi Laporan
      </h2>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Menunggu"
          value={statistik?.antrean_verifikasi || 0}
          icon="📋"
        />
        <StatCard
          title="Prioritas Tinggi"
          value={statistik?.prioritas_tinggi || 0}
          icon="🚨"
        />
        <StatCard
          title="Potensi Duplikat"
          value={statistik?.duplikat || 0}
          icon="📄"
        />
        <StatCard
          title="Disetujui Hari Ini"
          value={statistik?.disetujui_hari_ini || 0}
          icon="✅"
        />
      </div>

      {/* EMPTY */}
      <div className="bg-white p-12 rounded-3xl border border-dashed text-center shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📋</span>
        </div>

        <h3 className="text-2xl font-bold text-gray-800">
          Belum ada laporan masuk
        </h3>

        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          Semua laporan telah diproses atau belum ada pengaduan baru dari masyarakat.
        </p>

        <button 
          onClick={() => navigate('/internal/admin/laporan_penindakan')}
          className="mt-6 bg-blue-950 hover:bg-blue-900 text-white px-8 py-3 rounded-2xl font-semibold transition"
        >
          Laporan Penindakan
        </button>
      </div>
    </>
  );
}

/* =========================================================
   LAPORAN LIST STATE
========================================================= */

function LaporanListState({ laporan, selectedLaporan, onSelectLaporan, statistik }) {
  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Verifikasi Laporan
      </h2>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Menunggu"
          value={statistik?.antrean_verifikasi || laporan.length}
          icon="📋"
        />
        <StatCard
          title="Prioritas Tinggi"
          value={statistik?.prioritas_tinggi || 0}
          icon="🚨"
        />
        <StatCard
          title="Potensi Duplikat"
          value={statistik?.duplikat || 0}
          icon="📄"
        />
        <StatCard
          title="Disetujui Hari Ini"
          value={statistik?.disetujui_hari_ini || 0}
          icon="✅"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DAFTAR LAPORAN */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-800">Daftar Laporan</h3>
            <p className="text-xs text-gray-500 mt-1">{laporan.length} laporan menunggu</p>
          </div>
          // Cari bagian ini di dalam LaporanListState
          <div className="overflow-y-auto flex-1 divide-y max-h-96">
            {laporan.map((l, index) => (
              <button
                key={l.id_laporan || index} // Ganti 'l.id' menjadi 'l.id_laporan'
                onClick={() => onSelectLaporan(l)}
                className={`w-full text-left p-4 transition ${
                  selectedLaporan?.id_laporan === l.id_laporan // Ganti 'id' menjadi 'id_laporan'
                    ? 'bg-blue-50 border-l-4 border-l-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <p className="font-bold text-sm text-gray-900">{l.kode_laporan}</p> {/* Gunakan kode_laporan */}
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{l.alamat}</p>
              </button>
            ))}
          </div>
        </div>

        {/* DETAIL LAPORAN */}
        {selectedLaporan && (
          <DetailLaporanCard laporan={selectedLaporan} />
        )}
      </div>
    </>
  );
}

function DetailLaporanCard({ laporan }) {
  const [tindakan, setTindakan] = useState('setujui');
  const [petugasList, setPetugasList] = useState([]);
  const [loadingPetugas, setLoadingPetugas] = useState(true);
  const [petugas, setPetugas] = useState('');
  const [alasanTolak, setAlasanTolak] = useState('');
  
  // Mengambil token dari store untuk otentikasi
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    const fetchPetugas = async () => {
      try {
        setLoadingPetugas(true);
        // Sesuaikan URL endpoint dengan backend Anda
        const res = await axios.get('http://localhost:3000/api/admin/petugas?status=aktif', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("PETUGAS RESPONSE:", res.data);
        const petugasData = Array.isArray(
          res.data?.data?.data
        )
          ? res.data.data.data
          : [];

        console.log("PETUGAS ARRAY:", petugasData);

        setPetugasList(petugasData);
        // Pastikan struktur response sesuai, misal res.data.data
        
      } catch (err) {
        console.error("Gagal mengambil data petugas:", err);
      } finally {
        setLoadingPetugas(false);
      }
    };

    fetchPetugas();
  }, [token]);

  const handleAction = async () => {
    const idLaporan = laporan.id_laporan;
    console.log("ID Laporan yang akan diproses:", idLaporan);

    if (!idLaporan) {
      alert("Error: ID Laporan tidak ditemukan!");
      return;
    }
    try {
      if (tindakan === 'setujui') {
        // Pastikan semua data yang diminta backend dikirim
        const payload = {
          id_petugas: petugas, // Sesuaikan dengan yang dipilih di <select>
          tindakan_direkomendasikan: 'tindak_lanjut', // Berikan nilai default jika di UI belum ada
          catatan_tugas: 'Segera tangani laporan ini', // Berikan nilai default
          batas_waktu_penanganan: new Date().toISOString() // Berikan nilai default/tgl hari ini
        };

        await axios.post(
          `http://localhost:3000/api/admin/laporan/${idLaporan}/tugaskan`, 
          payload, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // GUNAKAN idLaporan DI URL
        await axios.put(
          `http://localhost:3000/api/admin/laporan/${idLaporan}/tolak`, 
          { catatan: alasanTolak }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Aksi berhasil diproses!");
      window.location.reload();
    } catch (err) {
      console.error("Detail Error:", err.response?.data || err);
      alert("Gagal: " + (err.response?.data?.message || "Terjadi kesalahan"));
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {laporan.kode_laporan}
            </h3>
            <span className="inline-block mt-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
              SLA &lt; 1 Jam
            </span>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            {new Date(laporan.created_at).toLocaleDateString('id-ID')}
          </p>
        </div>

        {laporan.foto_bukti && (
          <div className="mb-6">
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${laporan.foto_bukti}`}
              className="rounded-2xl w-full h-64 object-cover"
              alt="Bukti Laporan"
            />
          </div>
        )}

        <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">Informasi Lokasi</h4>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 font-medium mb-6">
          {laporan.alamat}
        </div>

        <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">Kategori</h4>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 font-medium mb-6">
          {laporan.KategoriPelanggaran?.nama_kategori || 'Kategori tidak diketahui'}
        </div>

        <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">Deskripsi</h4>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 mb-6">
          {laporan.deskripsi}
        </div>

        {/* PANEL ACTION */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm mt-6">
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setTindakan('setujui')}
              className={`flex-1 py-3 rounded-2xl font-bold ${tindakan === 'setujui' ? 'bg-blue-950 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Setujui
            </button>
            <button 
              onClick={() => setTindakan('tolak')}
              className={`flex-1 py-3 rounded-2xl font-bold ${tindakan === 'tolak' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Tolak
            </button>
          </div>

          {tindakan === 'setujui' ? (
            <div>
              <h4 className="font-bold mb-2">🛠 Penugasan Lapangan</h4>
              {loadingPetugas ? (
                <p className="text-sm text-gray-400">Memuat petugas...</p>
              ) : (
                <select 
                  className="w-full p-3 border rounded-xl mb-4" 
                  onChange={(e) => setPetugas(e.target.value)}
                  value={petugas}
                >
                  <option value="">Pilih Petugas yang Tersedia...</option>
                  {Array.isArray(petugasList) && petugasList.map((p, index) => (
                    // UBAH p.id MENJADI p.id_user DI BAWAH INI
                    <option key={p.id_user || `petugas-${index}`} value={p.id_user}>
                      {p.nama} ({p.unit})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div>
              <h4 className="font-bold mb-2">❌ Alasan Penolakan</h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['Foto Kurang Jelas', 'Bukan Pelanggaran', 'Laporan Duplikat'].map((alasan) => (
                  <button 
                    key={alasan}
                    type="button"
                    onClick={() => setAlasanTolak(alasan)}
                    className={`text-xs p-2 rounded-lg border ${alasanTolak === alasan ? 'bg-red-100 border-red-500' : 'border-gray-200'}`}
                  >
                    {alasan}
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full p-3 border rounded-xl text-sm" 
                placeholder="Tambahkan catatan khusus penolakan..."
                value={alasanTolak}
                onChange={(e) => setAlasanTolak(e.target.value)}
              />
            </div>
          )}

          <button 
            onClick={handleAction}
            className="w-full mt-6 py-4 bg-blue-950 text-white rounded-2xl font-bold hover:bg-blue-900"
          >
            {tindakan === 'setujui' ? 'Konfirmasi Penugasan' : 'Konfirmasi Penolakan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{icon}</div>
    </div>
  );
}

/* =========================================================
   LAYOUT & SIDEBAR
========================================================= */

function LayoutAdmin({ children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
          <div>
            <h1 className="font-bold text-gray-800 leading-none">Admin Dishub</h1>
            <p className="text-xs text-gray-400 mt-0.5">Sistem Verifikasi Laporan</p>
          </div>
        </div>
        <button onClick={() => navigate('/internal/admin/profil')}>
          <img src="/path-to-admin-photo.jpg" alt="Admin" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
        </button>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-blue-950 flex-col">
          <div 
            onClick={() => navigate('/internal/admin/profil')} 
            className="px-5 py-5 border-b border-blue-900 cursor-pointer hover:bg-blue-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white text-lg">🛡️</div>
              <div>
                <h2 className="text-white font-bold text-sm">Administrator</h2>
                <p className="text-blue-300 text-xs">Dishub Kota</p>
              </div>
            </div>
          </div>
          <div className="space-y-1 flex-1 p-4">
            <SidebarItem icon="📊" label="Dashboard" onClick={() => navigate('/internal/admin')} />
            <SidebarItem icon="📋" label="Laporan Masuk" active onClick={() => navigate('/internal/admin/laporan')} />
            <SidebarItem icon="📈" label="Penilaian Masyarakat" onClick={() => navigate('/internal/admin/penilaian')} />
            <SidebarItem icon="⚙️" label="Manajemen Petugas" onClick={() => navigate('/internal/admin/petugas')} />
          </div>
          <div className="p-4 border-t border-blue-900">
            <button onClick={() => navigate('/')} className="w-full text-blue-300 hover:text-white text-sm py-2 transition">← Keluar</button>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, onClick, active }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        active ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-900 hover:text-white'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}