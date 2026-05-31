const { Op } = require('sequelize');
const { Laporan, KategoriPelanggaran, Penilaian, Tindakan } = require('../models');
const { ok, fail } = require('../utils/response');
const { generateKodeLaporan } = require('../utils/kodeGenerator');

// ============================================================
// BUAT LAPORAN — Masyarakat
// ============================================================
exports.buatLaporan = async (req, res) => {
  try {
    const {
      nomor_plat, id_kategori, alamat, deskripsi,
      latitude, longitude, alamat_otomatis,
      akurasi_lokasi, jenis_kendaraan,
    } = req.body;

    if (!nomor_plat || !alamat || !deskripsi)
      return fail(res, 'Nomor plat, alamat, dan deskripsi wajib diisi');

    let prioritas = 'sedang';
    if (id_kategori) {
      const kat = await KategoriPelanggaran.findByPk(id_kategori);
      if (kat) prioritas = kat.prioritas_default;
    }

    const laporan = await Laporan.create({
      nomor_plat:    nomor_plat.toUpperCase(),
      id_kategori,
      alamat,
      deskripsi,
      foto_bukti:    req.file?.filename || null,
      latitude,
      longitude,
      alamat_otomatis,
      akurasi_lokasi,
      jenis_kendaraan,
      prioritas,
      kode_laporan:  generateKodeLaporan(),
      waktu_laporan: new Date(),
      sumber_laporan: 'web_masyarakat',
      status_laporan: 'menunggu_verifikasi',
    });

    return ok(res, { kode_laporan: laporan.kode_laporan }, 'Laporan berhasil dikirim', 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengirim laporan', 500);
  }
};

// ============================================================
// CEK STATUS — Masyarakat cek via kode laporan
// ============================================================

exports.cekStatus = async (req, res) => {
  try {
    const { kode } = req.query;

    if (!kode)
      return fail(res, 'Kode laporan wajib diisi');

    const laporan = await Laporan.findOne({
      where: {
        kode_laporan: kode
      },

      attributes: [
        'id_laporan',
        'kode_laporan',
        'nomor_plat',
        'status_laporan',
        'prioritas',
        'waktu_laporan',
        'alamat',
        'jenis_kendaraan',
        'foto_bukti'
      ],

      include: [
        {
          model: KategoriPelanggaran,
          as: 'kategori',
          attributes: ['nama_kategori']
        },

        {
          model: Tindakan,
          as: 'tindakan',
          attributes: [
            'foto_tindakan',
            'jenis_tindakan',
            'catatan_tindakan',
            'waktu_selesai'
          ],
          required: false
        }
      ]
    });

    if (!laporan)
      return fail(res, 'Laporan tidak ditemukan', 404);

    return ok(res, laporan);

  } catch (err) {
    console.error(err);
    return fail(res, 'Server error', 500);
  }
};

// ============================================================
// BATCH STATUS — Untuk halaman Riwayat masyarakat
// ============================================================
exports.batchStatus = async (req, res) => {
  try {
    const { kode_list } = req.body;
    if (!Array.isArray(kode_list) || kode_list.length === 0)
      return fail(res, 'kode_list wajib diisi');

    const kodes = kode_list.slice(0, 20);
    const laporan = await Laporan.findAll({
      where: { kode_laporan: { [Op.in]: kodes } },
      attributes: [
        'kode_laporan', 'nomor_plat', 'status_laporan',
        'prioritas', 'waktu_laporan', 'alamat',
        'jenis_kendaraan', 'foto_bukti',
      ],
      include: [{
        model: KategoriPelanggaran,
        as: 'kategori',
        attributes: ['nama_kategori'],
      }],
    });

    return ok(res, laporan);
  } catch (err) {
    console.error(err);
    return fail(res, 'Server error', 500);
  }
};

// ============================================================
// GET KATEGORI — Untuk dropdown form laporan
// ============================================================
exports.getKategori = async (req, res) => {
  try {
    const data = await KategoriPelanggaran.findAll({
      where: { status: 'aktif' },
      attributes: ['id_kategori', 'nama_kategori', 'prioritas_default'],
    });
    return ok(res, data);
  } catch (err) {
    console.error(err);
    return fail(res, 'Server error', 500);
  }
};

// ============================================================
// KIRIM PENILAIAN — Masyarakat beri rating
// ============================================================
exports.kirimPenilaian = async (req, res) => {
  try {
    const { kode_laporan, rating, komentar } = req.body;

    if (!kode_laporan || !rating)
      return res.status(400).json({ message: 'Kode laporan dan rating wajib diisi' });

    // 1. Pastikan laporan ada
    const laporan = await Laporan.findOne({ where: { kode_laporan } });
    if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan' });

    // 2. Cek apakah sudah pernah dinilai agar tidak duplikat
    const sudahDinilai = await Penilaian.findOne({ where: { id_laporan: laporan.id_laporan } });
    if (sudahDinilai) return res.status(400).json({ message: 'Penilaian sudah pernah diberikan' });

    // 3. Simpan ke tabel Penilaian agar terbaca di Admin Dashboard
    await Penilaian.create({
      id_laporan: laporan.id_laporan,
      rating: rating,
      komentar: komentar || '',
      created_at: new Date()
    });

    return res.status(200).json({ message: 'Penilaian berhasil dikirim' });
  } catch (err) {
    console.error("ERROR DETAIL PENILAIAN:", err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getAllLaporan = async (req, res) => {
  try {
    const data = await Laporan.findAll({
      order: [['waktu_laporan', 'DESC']]
    });
    return ok(res, data); // Pastikan ini mengirim array
  } catch (err) {
    return fail(res, 'Gagal mengambil data');
  }
};

// ============================================================
// ADMIN: Verifikasi Laporan (Setujui)
// ============================================================
exports.verifikasiLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { petugas_id } = req.body;

    const laporan = await Laporan.findByPk(id);
    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404);

    await laporan.update({
      status_laporan: 'diproses',
      petugas_id: petugas_id // Pastikan kolom ini ada di model Laporan
    });

    return ok(res, null, 'Laporan berhasil disetujui');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal verifikasi laporan', 500);
  }
};

// ============================================================
// ADMIN: Tolak Laporan
// ============================================================
exports.tolakLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { alasan_penolakan } = req.body;

    const laporan = await Laporan.findByPk(id);
    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404);

    await laporan.update({
      status_laporan: 'ditolak',
      catatan_admin: alasan_penolakan // Pastikan kolom ini ada di model Laporan
    });

    return ok(res, null, 'Laporan berhasil ditolak');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal menolak laporan', 500);
  }
};