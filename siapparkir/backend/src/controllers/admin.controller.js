const bcrypt = require('bcryptjs')
const { Op, fn, col, literal } = require('sequelize')
const {
  Laporan, User, KategoriPelanggaran, Penugasan,
  Tindakan, LogStatus, Notifikasi, Penilaian, Wilayah,
} = require('../models')
const { ok, fail } = require('../utils/response')
const { generateKodeUser } = require('../utils/kodeGenerator')

// ============================================================
// DASHBOARD
// ============================================================

exports.getDashboard = async (req, res) => {
  try {
    const now       = new Date()
    const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalBulanIni,
      menunggu,
      diproses,
      selesai,
      prioritasTinggi,
      petugasAktif,
      totalPetugas,
      ratingData,
      antreanVerifikasi,
    ] = await Promise.all([
      // Total laporan bulan ini
      Laporan.count({ where: { created_at: { [Op.gte]: awalBulan } } }),

      // Menunggu verifikasi
      Laporan.count({ where: { status_laporan: 'menunggu_verifikasi' } }),

      // Sedang diproses
      Laporan.count({
        where: { status_laporan: { [Op.in]: ['diverifikasi','ditugaskan','dalam_penanganan'] } }
      }),

      // Selesai bulan ini
      Laporan.count({
        where: {
          status_laporan: { [Op.in]: ['ditindak','selesai'] },
          created_at: { [Op.gte]: awalBulan },
        }
      }),

      // Prioritas tinggi menunggu
      Laporan.count({
        where: { prioritas: 'tinggi', status_laporan: 'menunggu_verifikasi' }
      }),

      // Petugas aktif
      User.count({ where: { role: 'petugas', status_petugas: 'aktif', status_akun: 'aktif' } }),

      // Total petugas
      User.count({ where: { role: 'petugas', status_akun: 'aktif' } }),

      // Rata-rata rating
      Penilaian.findOne({
        attributes: [[fn('AVG', col('rating')), 'rata_rata']],
        raw: true,
      }),

      // Antrean verifikasi terbaru (5 laporan)
      Laporan.findAll({
        where: { status_laporan: 'menunggu_verifikasi' },
        include: [{ model: KategoriPelanggaran, as: 'kategori', attributes: ['nama_kategori'] }],
        order: [['created_at', 'ASC']],
        limit: 5,
        attributes: ['id_laporan','kode_laporan','nomor_plat','alamat','created_at','prioritas','is_duplikat'],
      }),
    ])

    return ok(res, {
      statistik: {
        total_bulan_ini:  totalBulanIni,
        menunggu,
        diproses,
        selesai,
        prioritas_tinggi: prioritasTinggi,
        petugas_aktif:    petugasAktif,
        total_petugas:    totalPetugas,
        rata_rata_rating: parseFloat(ratingData?.rata_rata || 0).toFixed(1),
      },
      antrean_verifikasi: antreanVerifikasi,
    })
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// LAPORAN — LIST & FILTER
// ============================================================

exports.getLaporanList = async (req, res) => {
  try {
    const {
      page = 1, limit = 10,
      search, status, prioritas,
      id_kategori, tanggal_dari, tanggal_sampai,
      id_wilayah,
    } = req.query

    const where = {}

    if (search) {
      where[Op.or] = [
        { kode_laporan: { [Op.like]: `%${search}%` } },
        { nomor_plat:   { [Op.like]: `%${search}%` } },
        { alamat:       { [Op.like]: `%${search}%` } },
      ]
    }
    if (status)       where.status_laporan = status
    if (prioritas)    where.prioritas      = prioritas
    if (id_kategori)  where.id_kategori    = id_kategori
    if (tanggal_dari) {
      where.created_at = {
        [Op.gte]: new Date(tanggal_dari),
        ...(tanggal_sampai ? { [Op.lte]: new Date(tanggal_sampai) } : {}),
      }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Laporan.findAndCountAll({
      where,
      include: [
        { model: KategoriPelanggaran, as: 'kategori', attributes: ['nama_kategori'] },
        { model: User, as: 'petugas', attributes: ['id_user','nama','kode_user'], required: false },
        { model: Tindakan, as: 'tindakan', attributes: ['jenis_tindakan','status_tindakan'], required: false },
      ],
      order: [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset,
    })

    return ok(res, {
      data:       rows,
      total:      count,
      page:       parseInt(page),
      total_page: Math.ceil(count / parseInt(limit)),
    })
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// LAPORAN — DETAIL
// ============================================================

exports.getLaporanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Ganti findByPk dengan findOne untuk menentukan kolom PK secara spesifik
    const laporan = await Laporan.findOne({
      where: { id_laporan: id }, // <--- GANTI 'id_laporan' dengan nama kolom PK Anda yang sebenarnya
      include: [
        { model: KategoriPelanggaran, as: 'kategori' },
        { model: User, as: 'pelapor', attributes: ['nama', 'email', 'no_hp'], required: false },
        { model: User, as: 'petugas', attributes: ['id_user', 'nama', 'kode_user', 'no_hp'], required: false },
        { model: Tindakan, as: 'tindakan', required: false },
        { model: Penugasan, as: 'penugasan', required: false,
          include: [{ model: User, as: 'petugas', attributes: ['id_user', 'nama', 'kode_user'] }]
        },
        { model: LogStatus, as: 'log', required: false,
          include: [{ model: User, as: 'pengubah', attributes: ['nama', 'role'] }]
        },
      ],
      // order dipindahkan ke luar agar tidak error
      order: [[{ model: LogStatus, as: 'log' }, 'created_at', 'DESC']]
    });

    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404);
    return ok(res, laporan);
  } catch (err) {
    console.error(err);
    return fail(res, 'Server error', 500);
  }
};

// ============================================================
// LAPORAN — VERIFIKASI & TUGASKAN
// ============================================================

exports.verifikasiDanTugaskan = async (req, res) => {
  try {
    const { id } = req.params
    const { id_petugas, tindakan_direkomendasikan, catatan_tugas, batas_waktu_penanganan } = req.body

    if (!id_petugas) return fail(res, 'Petugas wajib dipilih')

    const laporan = await Laporan.findOne({ where: { id_laporan: id } });
    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404);
    if (!['menunggu_verifikasi','diverifikasi'].includes(laporan.status_laporan))
      return fail(res, 'Laporan tidak dapat diverifikasi pada status ini');

    const petugas = await User.findOne({
      where: { id_user: id_petugas, role: 'petugas', status_akun: 'aktif' }
    });
    if (!petugas) return fail(res, 'Petugas tidak ditemukan');

    // Update laporan
    await laporan.update({
      status_laporan: 'ditugaskan',
      id_petugas,
      updated_at: new Date(),
    })

    // Buat penugasan
    await Penugasan.create({
      id_laporan:                laporan.id_laporan,
      id_petugas,
      id_admin:                  req.user.id_user,
      catatan_tugas,
      waktu_penugasan:           new Date(),
      status_penugasan:          'aktif',
      tindakan_direkomendasikan,
      batas_waktu_penanganan:    batas_waktu_penanganan || null,
    })

    // Log status
    await LogStatus.create({
      id_laporan:  laporan.id_laporan,
      status_lama: 'menunggu_verifikasi',
      status_baru: 'ditugaskan',
      diubah_oleh: req.user.id_user,
      catatan:     `Ditugaskan ke petugas ${petugas.nama}`,
    })

    // Notifikasi ke petugas
    await Notifikasi.create({
      id_user:    id_petugas,
      id_laporan: laporan.id_laporan,
      judul:      'Penugasan Baru',
      pesan:      `Anda mendapat tugas baru: Laporan ${laporan.kode_laporan} di ${laporan.alamat}`,
    })

    return ok(res, null, 'Laporan berhasil diverifikasi dan ditugaskan')
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// LAPORAN — TOLAK
// ============================================================

exports.tolakLaporan = async (req, res) => {
  try {
    const { id } = req.params
    const { alasan_penolakan } = req.body

    if (!alasan_penolakan) return fail(res, 'Alasan penolakan wajib diisi')

    const laporan = await Laporan.findByPk(id)
    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404)

    await laporan.update({
      status_laporan:   'ditolak',
      alasan_penolakan,
      updated_at:       new Date(),
    })

    await LogStatus.create({
      id_laporan:  laporan.id_laporan,
      status_lama: laporan.status_laporan,
      status_baru: 'ditolak',
      diubah_oleh: req.user.id_user,
      catatan:     alasan_penolakan,
    })

    return ok(res, null, 'Laporan berhasil ditolak')
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// LAPORAN — LEWATI (skip ke laporan berikutnya)
// ============================================================

exports.lewatiLaporan = async (req, res) => {
  try {
    const { id } = req.params

    // Ambil laporan berikutnya yang menunggu verifikasi
    const berikutnya = await Laporan.findOne({
      where: {
        status_laporan: 'menunggu_verifikasi',
        id_laporan: { [Op.ne]: id },
      },
      order: [['created_at', 'ASC']],
      attributes: ['id_laporan','kode_laporan'],
    })

    return ok(res, { laporan_berikutnya: berikutnya })
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// LAPORAN — EXPORT (data untuk di-generate jadi Excel di frontend)
// ============================================================

exports.exportLaporan = async (req, res) => {
  try {
    const { tanggal_dari, tanggal_sampai, status, id_kategori } = req.query

    const where = {}
    if (status)      where.status_laporan = status
    if (id_kategori) where.id_kategori    = id_kategori
    if (tanggal_dari) {
      where.created_at = {
        [Op.gte]: new Date(tanggal_dari),
        ...(tanggal_sampai ? { [Op.lte]: new Date(tanggal_sampai) } : {}),
      }
    }

    const laporan = await Laporan.findAll({
      where,
      include: [
        { model: KategoriPelanggaran, as: 'kategori', attributes: ['nama_kategori'] },
        { model: User, as: 'petugas', attributes: ['nama'], required: false },
        { model: Tindakan, as: 'tindakan', attributes: ['jenis_tindakan'], required: false },
      ],
      order: [['created_at', 'DESC']],
    })

    // Format data untuk export
    const data = laporan.map(l => ({
      kode_laporan:     l.kode_laporan,
      nomor_plat:       l.nomor_plat,
      jenis_kendaraan:  l.jenis_kendaraan,
      alamat:           l.alamat,
      kategori:         l.kategori?.nama_kategori || '-',
      status:           l.status_laporan,
      prioritas:        l.prioritas,
      petugas:          l.petugas?.nama || '-',
      tindakan:         l.tindakan?.[0]?.jenis_tindakan || '-',
      waktu_laporan:    l.waktu_laporan,
      created_at:       l.created_at,
    }))

    return ok(res, { data, total: data.length })
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// PETUGAS — LIST
// ============================================================

exports.getPetugasList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status_petugas } = req.query
    const where = { role: 'petugas', status_akun: 'aktif' }

    if (search) {
      where[Op.or] = [
        { nama:      { [Op.like]: `%${search}%` } },
        { kode_user: { [Op.like]: `%${search}%` } },
        { nip:       { [Op.like]: `%${search}%` } },
      ]
    }
    if (status_petugas) where.status_petugas = status_petugas

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Wilayah, as: 'wilayah', attributes: ['nama_wilayah','kecamatan'] }],
      attributes: { exclude: ['password'] },
      order: [['nama', 'ASC']],
      limit:  parseInt(limit),
      offset,
    })

    // Hitung jumlah penindakan per petugas
    const petugasWithStats = await Promise.all(rows.map(async (p) => {
      const jumlah_penindakan = await Tindakan.count({
        where: { id_petugas: p.id_user, status_tindakan: 'selesai' }
      })
      return { ...p.toJSON(), jumlah_penindakan }
    }))

    // Statistik header
    const [total, aktif, dalamPenugasan, tersedia] = await Promise.all([
      User.count({ where: { role: 'petugas', status_akun: 'aktif' } }),
      User.count({ where: { role: 'petugas', status_akun: 'aktif', status_petugas: 'aktif' } }),
      Penugasan.count({ where: { status_penugasan: 'aktif' } }),
      User.count({ where: { role: 'petugas', status_akun: 'aktif', status_petugas: 'aktif' } }),
    ])

    return ok(res, {
      statistik: { total, aktif, dalam_penugasan: dalamPenugasan, tersedia },
      data:       petugasWithStats,
      total:      count,
      page:       parseInt(page),
      total_page: Math.ceil(count / parseInt(limit)),
    })
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// PETUGAS — Detail satu petugas by ID
// ============================================================
exports.getPetugasById = async (req, res) => {
  try {
    const { id } = req.params

    const petugas = await User.findOne({
      where: { id_user: id, role: 'petugas' },
      attributes: { exclude: ['password'] },
      include: [{ model: Wilayah, as: 'wilayah', required: false }],
    })

    if (!petugas) return fail(res, 'Petugas tidak ditemukan', 404)

    // Hitung total penindakan
    const jumlah_penindakan = await Tindakan.count({
      where: { id_petugas: id, status_tindakan: 'selesai' }
    })

    return ok(res, { ...petugas.toJSON(), jumlah_penindakan })
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}
// ============================================================
// PETUGAS — BUAT AKUN BARU
// ============================================================

exports.buatPetugas = async (req, res) => {
  try {
    const { nama, email, no_hp, nip, id_wilayah, status_petugas = 'aktif' } = req.body

    if (!nama || !email)
      return fail(res, 'Nama dan email wajib diisi')

    const existing = await User.findOne({ where: { email } })
    if (existing) return fail(res, 'Email sudah digunakan')

    // Password default: NIP atau nomor HP
    const passwordDefault = nip || no_hp || 'Dishub2026!'
    const hashed = await bcrypt.hash(passwordDefault, 10)

    const kode_user = generateKodeUser('petugas')

    const petugas = await User.create({
      nama, email, no_hp, nip,
      id_wilayah: id_wilayah || null,
      role:           'petugas',
      status_akun:    'aktif',
      status_petugas,
      kode_user,
      password: hashed,
      foto_profil: req.file?.filename || null,
    })

    return ok(res, {
      id_user:          petugas.id_user,
      kode_user:        petugas.kode_user,
      nama:             petugas.nama,
      email:            petugas.email,
      password_default: passwordDefault,
    }, 'Akun petugas berhasil dibuat', 201)
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// PETUGAS — UPDATE
// ============================================================

exports.updatePetugas = async (req, res) => {
  try {
    const { id } = req.params
    const { nama, email, no_hp, nip, id_wilayah, status_petugas, status_akun } = req.body

    const petugas = await User.findOne({ where: { id_user: id, role: 'petugas' } })
    if (!petugas) return fail(res, 'Petugas tidak ditemukan', 404)

    await petugas.update({
      nama:          nama          || petugas.nama,
      email:         email         || petugas.email,
      no_hp:         no_hp         || petugas.no_hp,
      nip:           nip           || petugas.nip,
      id_wilayah:    id_wilayah    || petugas.id_wilayah,
      status_petugas:status_petugas|| petugas.status_petugas,
      status_akun:   status_akun   || petugas.status_akun,
      foto_profil:   req.file?.filename || petugas.foto_profil,
    })

    return ok(res, null, 'Data petugas berhasil diupdate')
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// PETUGAS — TOGGLE STATUS (aktif/istirahat/off)
// ============================================================

exports.toggleStatusPetugas = async (req, res) => {
  try {
    const { id } = req.params
    const { status_petugas } = req.body

    if (!['aktif','istirahat','off'].includes(status_petugas))
      return fail(res, 'Status tidak valid')

    const petugas = await User.findOne({ where: { id_user: id, role: 'petugas' } })
    if (!petugas) return fail(res, 'Petugas tidak ditemukan', 404)

    await petugas.update({ status_petugas })
    return ok(res, null, `Status petugas diubah ke ${status_petugas}`)
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// PETUGAS TERSEDIA — untuk dropdown saat penugasan
// ============================================================

exports.getPetugasTersedia = async (req, res) => {
  try {
    const petugas = await User.findAll({
      where: { role: 'petugas', status_akun: 'aktif', status_petugas: 'aktif' },
      attributes: ['id_user','nama','kode_user','no_hp','status_petugas'],
      include: [{ model: Wilayah, as: 'wilayah', attributes: ['nama_wilayah','kecamatan'] }],
      order: [['nama', 'ASC']],
    })
    return ok(res, petugas)
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// PENILAIAN MASYARAKAT
// ============================================================

exports.getPenilaian = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)

    const [penilaian, rataRata, totalUmpanBalik] = await Promise.all([
      Penilaian.findAndCountAll({
        include: [
          { model: Laporan, attributes: ['kode_laporan','alamat'] },
          { model: User,    attributes: ['nama'], required: false },
        ],
        order: [['created_at', 'DESC']],
        limit:  parseInt(limit),
        offset,
      }),
      Penilaian.findOne({
        attributes: [[fn('AVG', col('rating')), 'rata_rata']],
        raw: true,
      }),
      Penilaian.count(),
    ])

    // Statistik laporan
    const [laporanAktif, kasusVerifikasi] = await Promise.all([
      Laporan.count({ where: { status_laporan: { [Op.ne]: 'selesai' } } }),
      Laporan.count({ where: { status_laporan: { [Op.in]: ['diverifikasi','ditugaskan','dalam_penanganan','ditindak','selesai'] } } }),
    ])

    return ok(res, {
      statistik: {
        laporan_aktif:     laporanAktif,
        kasus_verifikasi:  kasusVerifikasi,
        umpan_balik:       totalUmpanBalik,
        rata_rata_rating:  parseFloat(rataRata?.rata_rata || 0).toFixed(1),
      },
      data:       penilaian.rows,
      total:      penilaian.count,
      page:       parseInt(page),
      total_page: Math.ceil(penilaian.count / parseInt(limit)),
    })
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// WILAYAH
// ============================================================

exports.getWilayah = async (req, res) => {
  try {
    const wilayah = await Wilayah.findAll({ order: [['nama_wilayah','ASC']] })
    return ok(res, wilayah)
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

exports.buatWilayah = async (req, res) => {
  try {
    const { nama_wilayah, kecamatan, kelurahan, keterangan, latitude_pusat, longitude_pusat } = req.body
    if (!nama_wilayah) return fail(res, 'Nama wilayah wajib diisi')
    const wilayah = await Wilayah.create({ nama_wilayah, kecamatan, kelurahan, keterangan, latitude_pusat, longitude_pusat })
    return ok(res, wilayah, 'Wilayah berhasil ditambahkan', 201)
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// NOTIFIKASI ADMIN
// ============================================================

exports.getNotifikasi = async (req, res) => {
  try {
    const notif = await Notifikasi.findAll({
      where: { id_user: req.user.id_user },
      include: [{ model: Laporan, attributes: ['kode_laporan'], required: false }],
      order: [['created_at', 'DESC']],
      limit: 20,
    })
    const belumDibaca = await Notifikasi.count({
      where: { id_user: req.user.id_user, status_baca: 'belum' }
    })
    return ok(res, { data: notif, belum_dibaca: belumDibaca })
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

exports.bacaNotifikasi = async (req, res) => {
  try {
    await Notifikasi.update(
      { status_baca: 'sudah' },
      { where: { id_user: req.user.id_user } }
    )
    return ok(res, null, 'Notifikasi ditandai sudah dibaca')
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}


// ============================================================
// PROFIL ADMIN — Get & Update
// ============================================================

exports.getProfil = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id_user, {
      attributes: { exclude: ['password'] },
      include: [{ model: Wilayah, as: 'wilayah', required: false }],
    })
    return ok(res, user)
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

exports.updateProfil = async (req, res) => {
  try {
    const { nama, email, no_hp, password } = req.body
    const user = await User.findByPk(req.user.id_user)
    if (!user) return fail(res, 'User tidak ditemukan', 404)

    const updateData = {
      nama:        nama  || user.nama,
      email:       email || user.email,
      no_hp:       no_hp || user.no_hp,
      foto_profil: req.file?.filename || user.foto_profil,
    }

    if (password && password.trim() !== '') {
      const bcrypt = require('bcryptjs')
      updateData.password = await bcrypt.hash(password, 10)
    }

    await user.update(updateData)
    return ok(res, null, 'Profil berhasil diupdate')
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}