import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

import LandingPage       from '../pages/public/LandingPage'
import LaporPage         from '../pages/public/LaporPage'
import CekStatusPage     from '../pages/public/CekStatusPage'
import RiwayatPage       from '../pages/public/RiwayatPage'
import DashboardPage     from '../pages/public/Dashboard'
import LoginPage         from '../pages/internal/LoginPage'
import AdminLayout from '../components/layout/AdminLayout';
import PetugasLayout from '../components/layout/PetugasLayout';
import MasyarakatLayout from '../components/layout/MasyarakatLayout';
import AdminDashboard    from '../pages/internal/admin/AdminDashboard'
import AdminLaporan      from '../pages/internal/admin/AdminLaporan'
import AdminPetugas      from '../pages/internal/admin/AdminPetugas'
import AdminLaporanPenindakan from '../pages/internal/admin/AdminLaporanPenindakan';
import TambahPetugas     from '../pages/internal/admin/TambahPetugas'
import PenilaianMasyarakat from '../pages/internal/admin/PenilaianMasyarakat'
import PreviewPDF        from '../pages/internal/admin/PreviewPDF';
import ProfilAdmin       from '../pages/internal/admin/ProfilAdmin'
import PetugasDashboard  from '../pages/internal/petugas/PetugasDashboard'
import LaporanMasuk      from '../pages/internal/petugas/LaporanMasuk'
import ProfilPetugas     from '../pages/internal/petugas/ProfilPetugas'
import DetailPenindakan   from '../pages/internal/petugas/DetailPenindakan'
import SelesaiPenindakan from '../pages/internal/petugas/SelesaiPenindakan'
import PrivateRoute      from './PrivateRoute'
import SuksesPage        from '../pages/public/SuksesPage'
import RiwayatPenindakan from '../pages/internal/petugas/RiwayatPenindakan'

import DetailLaporanPage from '../pages/public/DetailLaporanPage'
import EditPetugas from '../pages/internal/admin/EditPetugas'

const AdminRouteWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

const PetugasRouteWrapper = () => (
  <PetugasLayout>
    <Outlet />
  </PetugasLayout>
);

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-7xl font-extrabold text-blue-950">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-bold text-gray-900">
        Halaman tidak ditemukan
      </h2>

      <p className="text-gray-500 mt-2 text-sm max-w-md">
        Maaf, halaman yang kamu cari tidak tersedia atau belum terdaftar di sistem SiapParkir.
      </p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================================================================== */}
        {/* UTAMA: Halaman paling awal saat diakses (/) adalah Landing Page Public */}
        {/* ==================================================================== */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Rute Publik Lainnya */}
          <Route element={<MasyarakatLayout />}>
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/lapor"      element={<LaporPage />} />
            <Route path="/cek-status" element={<CekStatusPage />} />
            <Route path="/riwayat"    element={<RiwayatPage />} />
            <Route path="/detail/:kode" element={<DetailLaporanPage />} />
          </Route>
          <Route path="/sukses"       element={<SuksesPage />} />

        {/* Internal / Login Area */}
        <Route path="/internal/login" element={<LoginPage />} />

        {/* Hak Akses: Admin */}
        <Route element={<PrivateRoute role="admin" />}>
          <Route element={<AdminRouteWrapper />}>
            <Route path="/internal/admin"         element={<AdminDashboard />} />
            <Route path="/internal/admin/laporan" element={<AdminLaporan />} />
            <Route path="/internal/admin/petugas" element={<AdminPetugas />} />
            <Route path="/internal/admin/laporan_penindakan" element={<AdminLaporanPenindakan />} />
            <Route path="/internal/admin/tambah_petugas" element={<TambahPetugas />} />
            <Route path="/internal/admin/penilaian" element={<PenilaianMasyarakat />} />
            <Route path="/internal/admin/profil" element={<ProfilAdmin />} />
            <Route path="/internal/admin/petugas/:id/edit" element={<EditPetugas />} />
          </Route>
          <Route path="/internal/admin/preview-laporan" element={<PreviewPDF />} />
        </Route>

        {/* Hak Akses: Petugas */}
        <Route element={<PrivateRoute role="petugas" />}>
          <Route element={<PetugasRouteWrapper />}>
            <Route path="/internal/petugas"       element={<PetugasDashboard />} />
            <Route path="/internal/petugas/profil" element={<ProfilPetugas />} />
            <Route path="/internal/petugas/laporan" element={<LaporanMasuk/>} />
            <Route path="/internal/petugas/detail-penindakan/:id" element={<DetailPenindakan />} />
            <Route path="/internal/petugas/riwayat" element={<RiwayatPenindakan />} />
          </Route>
          <Route path="/internal/petugas/selesai" element={<SelesaiPenindakan />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
