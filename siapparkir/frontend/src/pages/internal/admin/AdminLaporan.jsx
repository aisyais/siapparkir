import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLaporan({ laporan, statistik }) {
  const navigate = useNavigate();

  return (
    <LayoutAdmin>
      {!laporan ? (
        <EmptyState statistik={statistik} navigate={navigate} />
      ) : (
        <DetailState laporan={laporan} />
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
          value={statistik?.menunggu || 0}
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
  )
}

/* =========================================================
   DETAIL STATE
========================================================= */

function DetailState({ laporan }) {

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Verifikasi Laporan
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* DETAIL */}
        <div className="lg:col-span-2">

          <div className="bg-white p-6 rounded-3xl border shadow-sm">

            <div className="flex justify-between items-start mb-6">

              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {laporan.kode_laporan || laporan.id}
                </h3>

                <span className="inline-block mt-1 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
                  SLA &lt; 1 Jam
                </span>
              </div>

              <p className="text-sm text-gray-400 font-medium">
                {laporan.tanggal || 'Baru saja'}
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">

              <img
                src={laporan.foto_utama}
                className="rounded-2xl w-full h-64 object-cover"
                alt="Bukti Utama"
              />

              <div className="grid grid-rows-2 gap-3">

                <img
                  src={laporan.foto_1}
                  className="rounded-2xl w-full h-full object-cover"
                  alt="Detail 1"
                />

                <img
                  src={laporan.foto_2}
                  className="rounded-2xl w-full h-full object-cover"
                  alt="Detail 2"
                />

              </div>

            </div>

            <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">
              Informasi Lokasi
            </h4>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 font-medium">
              {laporan.alamat}
            </div>

          </div>

        </div>

        {/* ACTION */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-3xl border shadow-sm">

            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              🛠 Penugasan Lapangan
            </h4>

            <select className="w-full p-3 border rounded-xl mb-4 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Derek Kendaraan</option>
            </select>

            <div className="border p-4 rounded-xl bg-blue-50 border-blue-100">

              <p className="font-bold text-blue-900">
                Tim Derek 04
              </p>

              <p className="text-xs text-blue-700 mt-1">
                1.2 km (5 mnt) • <span className="font-bold">TERSEDIA</span>
              </p>

            </div>

          </div>

          <div className="flex gap-3">

            <button className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50">
              Lewati
            </button>

            <button className="flex-1 py-4 bg-blue-950 text-white rounded-2xl font-bold hover:bg-blue-900">
              Setujui & Tugaskan
            </button>

          </div>

        </div>

      </div>
    </>
  )
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
   LAYOUT & SIDEBAR (DIPERBARUI)
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
        <button onClick={() => navigate('/internal/admin/profil')}>
           <img src="/path-to-admin-photo.jpg" alt="Admin" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
        </button>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 bg-blue-950 flex-col">
          <div onClick={() => navigate('/internal/admin/profil')} className="px-5 py-5 border-b border-blue-900 cursor-pointer hover:bg-blue-900 transition-colors">
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
          <div className="p-4 border-t border-blue-900"><button onClick={() => navigate('/')} className="w-full text-blue-300 hover:text-white text-sm py-2 transition">← Keluar</button></div>
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