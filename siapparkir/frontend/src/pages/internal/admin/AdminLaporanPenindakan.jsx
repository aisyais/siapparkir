import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import useAuthStore from '../../../store/authStore';

export default function AdminLaporanPenindakan() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const fetchAllLaporan = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:3000/api/admin/laporan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data?.data || [];
        setLaporan(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error API:", err);
        setLaporan([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLaporan();
  }, [token]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(laporan);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LaporanPenindakan");
    XLSX.writeFile(workbook, "Data_Laporan_Penindakan.xlsx");
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const dataToExport = laporan.map(item => ({
        id: item.kode_laporan,
        waktu: new Date(item.created_at).toLocaleString('id-ID'),
        nopol: item.nomor_plat,
        kategori: item.kategori?.nama_kategori || '-',
        kecamatan: item.kecamatan || '-',
        tindakan: item.tindakan,
        petugas: item.petugas?.nama || '-',
        status: 'Selesai'
    }));

    localStorage.setItem('data_ekspor_dishub', JSON.stringify(dataToExport));
    window.open('/internal/admin/preview-laporan', '_blank');
    setShowExportModal(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat data...</div>;

  return (
    <LayoutAdmin>
      {/* MODAL EKSPOR GABUNGAN */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
            <div className="text-5xl mb-4">📥</div>
            <h2 className="font-bold text-xl mb-2">Export Selesai!</h2>
            <p className="text-sm text-gray-500 mb-6">Dokumen rekapitulasi siap untuk diproses lebih lanjut.</p>
            
            <div className="flex flex-col gap-3">
                <button onClick={exportToExcel} className="bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Download Excel (.xlsx)</button>
                <button onClick={handleExportPDF} className="bg-blue-950 text-white py-3 rounded-xl font-bold hover:bg-black transition">Download PDF (.pdf)</button>
                <button onClick={() => alert("Fitur Kirim Email Segera Hadir!")} className="bg-sky-200 text-sky-800 py-3 rounded-xl font-bold hover:bg-sky-300 transition flex items-center justify-center gap-2"><span>📧</span> Send to Email</button>
                <button onClick={() => setShowExportModal(false)} className="bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition">← Back to Reports</button>
            </div>
            </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-gray-900">Laporan Penindakan</h1>
            <p className="text-gray-500 mt-2">Manajemen database laporan dan aksi penegakan hukum.</p>
          </div>
          <button onClick={() => setShowExportModal(true)} className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm">📤 Ekspor Data</button>
        </div>

        {/* FILTER LENGKAP */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5">
          <div>  <label className="text-sm font-semibold text-gray-600 mb-2 block">    Cari Laporan  </label>  <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                type="text" 
                placeholder="No. Plat atau ID" 
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" 
                /> </div>
          </div>
          <div><label className="text-sm font-semibold text-gray-600 mb-2 block">Rentang Waktu</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"><option>Harian (Hari Ini)</option></select></div>
          <div><label className="text-sm font-semibold text-gray-600 mb-2 block">Jenis Pelanggaran</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"><option>Semua Pelanggaran</option></select></div>
          <div><label className="text-sm font-semibold text-gray-600 mb-2 block">Wilayah Kota</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"><option>Seluruh Wilayah</option></select></div>
          <div><label className="text-sm font-semibold text-gray-600 mb-2 block">Petugas</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm"><option>Semua Petugas</option></select></div>
        </div>

        {/* TABLE DENGAN KOLOM PETUGAS */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left">Report ID</th>
                <th className="px-6 py-4 text-left">Tanggal</th>
                <th className="px-6 py-4 text-left">Petugas</th>
                <th className="px-6 py-4 text-left">Plat Nomor</th>
                <th className="px-6 py-4 text-left">Pelanggaran</th>
                <th className="px-6 py-4 text-left">Tindakan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {laporan.map((item) => (
                <tr key={item.id_laporan} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-blue-900">#{item.kode_laporan}</td>
                  <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-medium">{item.petugas?.nama || 'N/A'}</td>
                  <td className="px-6 py-4"><span className="bg-black text-white px-2 py-1 rounded text-[10px] font-bold">{item.nomor_plat}</span></td>
                  <td className="px-6 py-4">{item.kategori?.nama_kategori || '-'}</td>
                  <td className="px-6 py-4"><span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">{item.tindakan}</span></td>
                  <td className="px-6 py-4 text-center"><button onClick={() => navigate(`/internal/admin/laporan/${item.id_laporan}`)} className="text-xl">👁️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutAdmin>
  );
}

/* =========================================================
   LAYOUT ADMIN (DIPERBARUI DENGAN PROFIL)
========================================================= */

function LayoutAdmin({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center text-white font-black text-sm">A</div>
          <div><h1 className="font-bold text-gray-800 leading-none">Admin Dishub</h1><p className="text-xs text-gray-400 mt-0.5">Sistem Verifikasi Laporan</p></div>
        </div>
        
        {/* PROFIL DI HEADER */}
        <button onClick={() => navigate('/internal/admin/profil')}>
           <img src="/path-to-admin-photo.jpg" alt="Admin" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
        </button>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-blue-950 flex-col">
          {/* PROFIL DI SIDEBAR */}
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-blue-800 text-white' : 'text-blue-300 hover:bg-blue-900 hover:text-white'}`}>
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}