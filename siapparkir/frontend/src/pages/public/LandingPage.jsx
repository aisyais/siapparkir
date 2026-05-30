import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate dari react-router-dom
import { Shield } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate(); // 2. Inisialisasi fungsi navigate di dalam komponen

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row antialiased font-sans">
      
      {/* SISI KIRI: Gambar Latar Belakang & Branding Utama */}
      <div className="relative w-full lg:w-[53%] min-h-[400px] lg:min-h-screen bg-[#0A1931] flex flex-col justify-end p-8 sm:p-12 lg:p-16 text-white overflow-hidden">
        
        {/* Layer Gambar Latar Belakang */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1200')` }}
        />
        
        {/* Konten Teks di Sisi Kiri */}
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Ketertiban Dimulai Dari Sini.
          </h1>
          
          <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed">
            Platform pelaporan resmi Dinas Perhubungan untuk menindak pelanggaran parkir demi kenyamanan dan kelancaran lalu lintas kota.
          </p>
        </div>
      </div>

      {/* SISI KANAN: Formulir / Aksi Utama (SiapParkir) */}
      <div className="w-full lg:w-[47%] flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-10">
          
          {/* Logo & Judul Aplikasi */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#001A57] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md tracking-wider">
              P
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">SiapParkir</span>
          </div>

          {/* Teks Selamat Datang */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
              Bantu kami mewujudkan jalanan yang tertib dan aman. Laporkan pelanggaran parkir liar di sekitar Anda.
            </p>
          </div>

          {/* Tombol Utama Akses Pelaporan Sesuai Format Anda */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 bg-[#001A57] hover:bg-[#00133f] text-white rounded-xl font-semibold text-base transition flex items-center justify-center gap-2"
            >
              Lapor Sekarang
              <span>→</span>
            </button>
          </div>

          {/* Spacer / Garis Pembatas Halus */}
          <div className="border-t border-gray-100 pt-6">
            
            {/* Informasi Enkripsi & Keamanan Data Pelapor */}
            <div className="flex items-start gap-4 p-4 bg-[#F4F7FF] border border-[#E2EAFD] rounded-2xl">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-[#001A57] flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-[#001A57] uppercase tracking-wide">
                  Resmi & Terenkripsi
                </h4>
                <p className="text-[11px] text-gray-500 font-semibold leading-normal">
                  Data pelapor akan dijaga kerahasiaannya oleh otoritas terkait.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default LandingPage;