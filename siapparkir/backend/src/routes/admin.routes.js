const router  = require('express').Router()
const admin   = require('../controllers/admin.controller')
const { verifyToken }  = require('../middleware/auth.middleware')
const { requireRole }  = require('../middleware/role.middleware')
const upload           = require('../middleware/upload.middleware')

// Semua route admin wajib login + role admin
router.use(verifyToken)
router.use(requireRole('admin'))

// Dashboard
router.get('/dashboard', admin.getDashboard)

// Laporan
router.get('/laporan',                  admin.getLaporanList)
router.get('/laporan/export',           admin.exportLaporan)
router.get('/laporan/:id',              admin.getLaporanDetail)
router.post('/laporan/:id/tugaskan',    admin.verifikasiDanTugaskan)
router.put('/laporan/:id/tolak',        admin.tolakLaporan)
router.get('/laporan/:id/lewati',       admin.lewatiLaporan)

// Petugas
router.get('/petugas',                  admin.getPetugasList)
router.get('/petugas/tersedia',         admin.getPetugasTersedia)
router.get('/petugas/:id',        admin.getPetugasById)
router.post('/petugas', upload.single('foto_profil'), admin.buatPetugas)
router.put('/petugas/:id', upload.single('foto_profil'), admin.updatePetugas)
router.put('/petugas/:id/status',       admin.toggleStatusPetugas)

// Penilaian
router.get('/penilaian', admin.getPenilaian)

// Wilayah
router.get('/wilayah',  admin.getWilayah)
router.post('/wilayah', admin.buatWilayah)

// Notifikasi
router.get('/notifikasi',      admin.getNotifikasi)
router.put('/notifikasi/baca', admin.bacaNotifikasi)
router.get('/profil',        admin.getProfil)
router.put('/profil/update', upload.single('foto_profil'), admin.updateProfil)
module.exports = router