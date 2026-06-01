import { useState } from 'react'
import { cekStatusLaporan } from '../../api/public.api'
import { STATUS_LABEL, STATUS_COLOR, formatTanggal } from '../../utils/formatters'
import Swal from 'sweetalert2';

export default function CekStatusPage() {
  const [kode, setKode]     = useState('')
  const [hasil, setHasil]   = useState(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleCek = async (e) => {
    e.preventDefault();

    // 1. Validasi Sederhana
    if (!kode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Masukkan kode laporan terlebih dahulu!',
        confirmButtonColor: '#001A57'
      });
      return;
    }

    setLoading(true);
    setError(''); 
    setHasil(null);

    try {
      // 2. Animasi Loading
      Swal.fire({
        title: 'Mencari Laporan...',
        text: 'Sedang memeriksa status di database.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const res = await cekStatusLaporan(kode.trim().toUpperCase());
      
      // 3. Jika Berhasil, tutup loading dan simpan hasil
      setHasil(res.data.data);
      Swal.close(); // Menutup modal loading

    } catch (err) {
      // 4. Jika Gagal, tampilkan pesan error yang cantik
      const message = err.response?.data?.message || 'Laporan tidak ditemukan.';
      
      Swal.fire({
        icon: 'error',
        title: 'Pencarian Gagal',
        text: message,
        confirmButtonColor: '#d33'
      });
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Cek Status Laporan</h1>
        <p className="text-gray-400 text-sm mb-6">Masukkan kode laporan yang kamu terima</p>

        <form onSubmit={handleCek} className="flex gap-2 mb-4">
          <input
            value={kode} onChange={e => setKode(e.target.value)}
            placeholder="LP-20260521-XXXXXX"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none uppercase"
          />
          <button
            type="submit" disabled={loading}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60 transition"
          >
            {loading ? '...' : 'Cek'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {hasil && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[hasil.status_laporan]}`}>
                {STATUS_LABEL[hasil.status_laporan]}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Kode</span>
              <span className="font-mono font-medium">{hasil.kode_laporan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Nomor Plat</span>
              <span className="font-medium">{hasil.nomor_plat}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Dilaporkan</span>
              <span>{formatTanggal(hasil.waktu_laporan)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Alamat</span>
              <p className="mt-1 text-gray-700">{hasil.alamat}</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-primary-600 hover:underline">← Kembali ke Beranda</a>
        </div>
      </div>
    </div>
  )
}