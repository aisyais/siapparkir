const { Op } = require('sequelize')
const {
  Laporan, User, KategoriPelanggaran,
  Penugasan, Tindakan, LogStatus, Notifikasi, Wilayah,
} = require('../models')
const { ok, fail } = require('../utils/response')

// ============================================================
// DASHBOARD — Grid tugas aktif milik petugas ini
// ============================================================

exports.getDashboard = async (req, res) => {
  try {
    const id_petugas = req.user.id_user

    // Tugas aktif yang ditugaskan ke petugas ini
    const tugasAktif = await Penugasan.findAll({
      where: {
        id_petugas,
        status_penugasan: 'aktif',
      },
      include: [{
        model: Laporan,
        include: [{ model: KategoriPelanggaran, as: 'kategori', attributes: ['nama_kategori'] }],
        attributes: [
          'id_laporan',
          'kode_laporan',
          'nomor_plat',
          'alamat',
          'foto_bukti',
          'prioritas',
          'status_laporan',
          'jenis_kendaraan',
          'waktu_laporan',
          'created_at',
          'latitude',
          'longitude'
        ],
      }],
      order: [
        // Prioritas tinggi duluan
        [{ model: Laporan }, 'prioritas', 'DESC'],
        ['waktu_penugasan', 'ASC'],
      ],
    })

    // Statistik ringkas
    const [totalSelesai, totalAktif, totalDitugaskan] = await Promise.all([
      Tindakan.count({ where: { id_petugas, status_tindakan: 'selesai' } }),
      Penugasan.count({ where: { id_petugas, status_penugasan: 'aktif' } }),
      Penugasan.count({ where: { id_petugas } }),
    ])

    // Info profil petugas
    const profil = await User.findByPk(id_petugas, {
      attributes: ['nama', 'kode_user', 'status_petugas', 'foto_profil'],
      include: [{ model: Wilayah, as: 'wilayah', attributes: ['nama_wilayah', 'kecamatan'] }],
    })

    return ok(res, {
      profil,
      statistik: {
        tugas_aktif:    totalAktif,
        total_ditugaskan: totalDitugaskan,
        total_selesai:  totalSelesai,
      },
      tugas_aktif: tugasAktif,
    })
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// TUGAS — List semua tugas petugas ini
// ============================================================

exports.getTugasList = async (req, res) => {
  try {
    const id_petugas = req.user.id_user
    const { page = 1, limit = 10, status_penugasan, prioritas } = req.query

    const where = { id_petugas }
    if (status_penugasan) where.status_penugasan = status_penugasan

    const laporanWhere = {}
    if (prioritas) laporanWhere.prioritas = prioritas

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Penugasan.findAndCountAll({
      where,
      include: [{
        model: Laporan,
        where: laporanWhere,
        required: false,
        include: [{ model: KategoriPelanggaran, as: 'kategori', attributes: ['nama_kategori'] }],
        attributes: [
          'id_laporan', 'kode_laporan', 'nomor_plat', 'alamat',
          'foto_bukti', 'prioritas', 'status_laporan',
          'jenis_kendaraan', 'waktu_laporan', 'latitude', 'longitude',
        ],
      }],
      order: [['waktu_penugasan', 'DESC']],
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
// TUGAS — Detail satu tugas
// ============================================================

exports.getTugasDetail = async (req, res) => {
  try {
    const { id } = req.params
    const id_petugas = req.user.id_user

    const penugasan = await Penugasan.findOne({
      where: { id_penugasan: id, id_petugas },
      include: [{
        model: Laporan,
        include: [
          { model: KategoriPelanggaran, as: 'kategori' },
          { model: LogStatus, as: 'log', required: false,
            include: [{ model: User, as: 'pengubah', attributes: ['nama', 'role'] }],
            order: [['created_at', 'DESC']],
          },
          { model: Tindakan, as: 'tindakan', required: false },
        ],
      }],
    })

    if (!penugasan) return fail(res, 'Tugas tidak ditemukan', 404)
    return ok(res, penugasan)
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// TUGAS — Mulai penanganan (petugas berangkat ke lokasi)
// ============================================================

exports.mulaiPenanganan = async (req, res) => {
  try {
    const { id } = req.params
    const id_petugas = req.user.id_user

    const penugasan = await Penugasan.findOne({
      where: { id_penugasan: id, id_petugas },
      include: [{ model: Laporan }],
    })

    if (!penugasan) return fail(res, 'Tugas tidak ditemukan', 404)

    const laporan = penugasan.Laporan
    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404)

    if (laporan.status_laporan === 'dalam_penanganan')
      return fail(res, 'Laporan sudah dalam penanganan')

    // Update status laporan
    await laporan.update({
      status_laporan: 'dalam_penanganan',
      updated_at:     new Date(),
    })

    // Log
    await LogStatus.create({
      id_laporan:  laporan.id_laporan,
      status_lama: 'ditugaskan',
      status_baru: 'dalam_penanganan',
      diubah_oleh: id_petugas,
      catatan:     'Petugas menuju lokasi',
    })

    return ok(res, null, 'Status diupdate: petugas menuju lokasi')
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// TUGAS — Submit tindakan & selesaikan penugasan
// ============================================================

exports.selesaikanTugas = async (req, res) => {
  try {
    const { id } = req.params
    const id_petugas = req.user.id_user
    const { jenis_tindakan, catatan_tindakan } = req.body

    if (!jenis_tindakan)
      return fail(res, 'Jenis tindakan wajib dipilih')

    const TINDAKAN_VALID = ['teguran', 'gembok', 'derek', 'pindah', 'tidak_ditemukan']
    if (!TINDAKAN_VALID.includes(jenis_tindakan))
      return fail(res, 'Jenis tindakan tidak valid')

    const penugasan = await Penugasan.findOne({
      where: { id_penugasan: id, id_petugas },
      include: [{ model: Laporan }],
    })

    if (!penugasan) return fail(res, 'Tugas tidak ditemukan', 404)

    const laporan = penugasan.Laporan
    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404)

    const foto_tindakan = req.file?.filename || null

    // Buat tindakan
    const tindakan = await Tindakan.create({
      id_laporan:       laporan.id_laporan,
      id_petugas,
      jenis_tindakan,
      catatan_tindakan: catatan_tindakan || null,
      foto_tindakan,
      waktu_mulai:      new Date(),
      waktu_selesai:    new Date(),
      status_tindakan:  'selesai',
    })

    // Update status laporan
    const statusBaru = jenis_tindakan === 'tidak_ditemukan' ? 'tidak_ditemukan' : 'ditindak'
    await laporan.update({
      status_laporan: statusBaru,
      updated_at:     new Date(),
    })

    // Update penugasan
    await penugasan.update({ status_penugasan: 'selesai' })

    // Log
    await LogStatus.create({
      id_laporan:  laporan.id_laporan,
      status_lama: 'dalam_penanganan',
      status_baru: statusBaru,
      diubah_oleh: id_petugas,
      catatan:     `Tindakan: ${jenis_tindakan}. ${catatan_tindakan || ''}`,
    })

    return ok(res, {
      id_tindakan:     tindakan.id_tindakan,
      jenis_tindakan:  tindakan.jenis_tindakan,
      foto_tindakan:   tindakan.foto_tindakan,
      kode_laporan:    laporan.kode_laporan,
      nomor_plat:      laporan.nomor_plat,
      alamat:          laporan.alamat,
    }, 'Penugasan berhasil diselesaikan')
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// LAPORAN MASUK — Antrian laporan (Image 5)
// Petugas bisa lihat semua laporan masuk di wilayahnya
// ============================================================

exports.getLaporanMasuk = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, id_wilayah, id_kategori } = req.query

    const where = {
      status_laporan: { [Op.in]: ['menunggu_verifikasi', 'diverifikasi'] },
    }

    if (search) {
      where[Op.or] = [
        { kode_laporan: { [Op.like]: `%${search}%` } },
        { nomor_plat:   { [Op.like]: `%${search}%` } },
        { alamat:       { [Op.like]: `%${search}%` } },
      ]
    }
    if (id_kategori) where.id_kategori = id_kategori

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Laporan.findAndCountAll({
      where,
      include: [
        { model: KategoriPelanggaran, as: 'kategori', attributes: ['nama_kategori'] },
      ],
      order: [
        ['prioritas',  'DESC'],
        ['created_at', 'ASC'],
      ],
      limit:  parseInt(limit),
      offset,
      attributes: [
        'id_laporan', 'kode_laporan', 'nomor_plat', 'foto_bukti',
        'alamat', 'status_laporan', 'prioritas', 'is_duplikat',
        'waktu_laporan', 'created_at',
      ],
    })

    // Statistik antrian
    const [totalAntrian, belumVerifikasi, indikasi_duplikat] = await Promise.all([
      Laporan.count({ where: { status_laporan: { [Op.in]: ['menunggu_verifikasi','diverifikasi'] } } }),
      Laporan.count({ where: { status_laporan: 'menunggu_verifikasi' } }),
      Laporan.count({ where: { is_duplikat: 1 } }),
    ])

    return ok(res, {
      statistik: {
        total_antrian:     totalAntrian,
        belum_verifikasi:  belumVerifikasi,
        indikasi_duplikat,
      },
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
// STATUS DIRI — Petugas update status sendiri
// ============================================================

exports.updateStatusDiri = async (req, res) => {
  try {
    const { status_petugas } = req.body
    const id_petugas = req.user.id_user

    if (!['aktif', 'istirahat', 'off'].includes(status_petugas))
      return fail(res, 'Status tidak valid')

    await User.update(
      { status_petugas },
      { where: { id_user: id_petugas } }
    )

    return ok(res, null, `Status diubah ke ${status_petugas}`)
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// ADMIN - Update Status Petugas
// ============================================================

exports.updateStatusPetugas = async (req, res) => {
  try {
    const { id } = req.params
    const { status_petugas } = req.body

    if (!['aktif', 'istirahat', 'off'].includes(status_petugas))
      return fail(res, 'Status tidak valid')

    const petugas = await User.findOne({
      where: {
        id_user: id,
        role: 'petugas'
      }
    })

    if (!petugas)
      return fail(res, 'Petugas tidak ditemukan', 404)

    await petugas.update({
      status_petugas
    })

    return ok(
      res,
      petugas,
      `Status berhasil diubah menjadi ${status_petugas}`
    )
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// NOTIFIKASI
// ============================================================

exports.getNotifikasi = async (req, res) => {
  try {
    const id_user = req.user.id_user

    const notif = await Notifikasi.findAll({
      where: { id_user },
      include: [{
        model: Laporan,
        attributes: ['kode_laporan', 'nomor_plat', 'alamat'],
        required: false,
      }],
      order: [['created_at', 'DESC']],
      limit: 20,
    })

    const belum_dibaca = await Notifikasi.count({
      where: { id_user, status_baca: 'belum' }
    })

    return ok(res, { data: notif, belum_dibaca })
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

exports.bacaNotifikasi = async (req, res) => {
  try {
    await Notifikasi.update(
      { status_baca: 'sudah' },
      { where: { id_user: req.user.id_user, status_baca: 'belum' } }
    )
    return ok(res, null, 'Semua notifikasi ditandai sudah dibaca')
  } catch (err) {
    return fail(res, 'Server error', 500)
  }
}

exports.kirimPenilaian = async (req, res) => {
  try {
    const { kode_laporan, rating, komentar } = req.body

    if (!kode_laporan || !rating)
      return fail(res, 'Kode laporan dan rating wajib diisi')

    if (rating < 1 || rating > 5)
      return fail(res, 'Rating harus antara 1-5')

    const laporan = await Laporan.findOne({ where: { kode_laporan } })
    if (!laporan) return fail(res, 'Laporan tidak ditemukan', 404)

    if (!['ditindak', 'selesai'].includes(laporan.status_laporan))
      return fail(res, 'Penilaian hanya bisa diberikan untuk laporan yang sudah selesai')

    // Cek sudah pernah dinilai
    const { Penilaian } = require('../models')
    const existing = await Penilaian.findOne({ where: { id_laporan: laporan.id_laporan } })
    if (existing) return fail(res, 'Laporan ini sudah pernah dinilai')

    await Penilaian.create({
      id_laporan: laporan.id_laporan,
      rating:     parseInt(rating),
      komentar:   komentar || null,
    })

    // Update status jadi selesai
    await laporan.update({ status_laporan: 'selesai', updated_at: new Date() })

    return ok(res, null, 'Penilaian berhasil dikirim', 201)
  } catch (err) {
    console.error(err)
    return fail(res, 'Server error', 500)
  }
}

// ============================================================
// PROFIL PETUGAS — Get & Update
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
    // 1. Tambahkan status_petugas ke sini
    const { nama, email, no_hp, password, status_petugas } = req.body
    
    const user = await User.findByPk(req.user.id_user)
    if (!user) return fail(res, 'User tidak ditemukan', 404)

    const updateData = {
      nama:          nama          || user.nama,
      email:         email         || user.email,
      no_hp:         no_hp         || user.no_hp,
      // 2. Tambahkan ini agar masuk ke database
      status_petugas: status_petugas || user.status_petugas, 
      foto_profil:   req.file?.filename || user.foto_profil,
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