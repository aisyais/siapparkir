import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';

export default function ManajemenPetugas() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const [petugasList, setPetugasList] = useState([]);
  const [filteredPetugas, setFilteredPetugas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [statistik, setStatistik] = useState({
    total: 0,
    aktif: 0,
    penugasan: 0,
    tersedia: 0,
  });

  useEffect(() => {
    fetchPetugas();
  }, [token]);

  const fetchPetugas = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        'http://localhost:3000/api/admin/petugas',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payload = res.data?.data || {};
      const data = Array.isArray(payload.data) ? payload.data : [];

      setPetugasList(data);
      setFilteredPetugas(data);

      setStatistik({
        total: payload.statistik?.total || 0,
        aktif: payload.statistik?.aktif || 0,
        penugasan: payload.statistik?.dalam_penugasan || 0,
        tersedia: payload.statistik?.tersedia || 0,
      });

    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search.trim()) {
      setFilteredPetugas(petugasList);
      return;
    }

    const keyword = search.toLowerCase();
    setFilteredPetugas(
      petugasList.filter((p) =>
        p.kode_user?.toLowerCase().includes(keyword) ||
        p.nama?.toLowerCase().includes(keyword) ||
        p.nip?.toLowerCase().includes(keyword)
      )
    );
  }, [search, petugasList]);

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Manajemen Petugas Lapangan
      </h2>

      {loading ? (
        <div className="bg-white p-10 rounded-2xl border text-center text-gray-400">
          ⏳ Memuat data petugas...
        </div>
      ) : (
        <>
          {/* STAT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="TOTAL PETUGAS" value={statistik.total} icon="🏢" />
            <StatCard title="PETUGAS AKTIF" value={statistik.aktif} icon="👤" />
            <StatCard title="DALAM PENUGASAN" value={statistik.penugasan} icon="🚓" />
            <StatCard title="TERSEDIA" value={statistik.tersedia} icon="📅" />
          </div>

          {/* SEARCH + ADD */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Cari ID, nama, atau NIP petugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => navigate('/internal/admin/tambah_petugas')}
              className="bg-blue-950 hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold text-sm"
            >
              + Tambah Petugas
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4 text-left">ID Petugas</th>
                    <th className="px-6 py-4 text-left">Nama Petugas</th>
                    <th className="px-6 py-4 text-left">Wilayah</th>
                    <th className="px-6 py-4 text-left">Penindakan</th>
                    <th className="px-6 py-4 text-left">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPetugas.length > 0 ? (
                    filteredPetugas.map((p) => (
                      <tr
                        key={p.id_user}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/internal/admin/petugas/${p.id_user}`)}
                      >
                        <td className="px-6 py-4 font-mono text-blue-900">
                          #{p.kode_user || p.id_user}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold">
                              {p.foto_profil ? (
                                <img
                                  src={`http://localhost:3000/uploads/${p.foto_profil}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                  alt={p.nama}
                                />
                              ) : (
                                p.nama?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{p.nama}</p>
                              <p className="text-xs text-gray-400">{p.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {p.wilayah?.nama_wilayah || '-'}
                        </td>

                        <td className="px-6 py-4 font-bold">
                          {p.jumlah_penindakan || 0}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={p.status_petugas} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-gray-400">
                        Tidak ada petugas ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t text-xs text-gray-400">
              Menampilkan {filteredPetugas.length} dari {statistik.total}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function StatusBadge({ status }) {
  const styles = {
    aktif: 'bg-green-100 text-green-700',
    istirahat: 'bg-yellow-100 text-yellow-700',
    off: 'bg-gray-100 text-gray-600',
  };

  const labels = {
    aktif: 'Aktif',
    istirahat: 'Istirahat',
    off: 'Off',
  };

  const s = status || 'off';

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[s]}`}>
      • {labels[s]}
    </span>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border">
      <div className="flex justify-between">
        <div>
          <div className="text-xs text-gray-400">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}