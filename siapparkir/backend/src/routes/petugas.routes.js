const router  = require('express').Router()
const petugas = require('../controllers/petugas.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { requireRole } = require('../middleware/role.middleware')
const upload          = require('../middleware/upload.middleware')

// Semua route petugas wajib login + role petugas
router.use(verifyToken)
router.use(requireRole('petugas'))

// Dashboard
router.get('/dashboard', petugas.getDashboard)

// Tugas lapangan
router.get('/tugas',              petugas.getTugasList)
router.get('/tugas/:id',          petugas.getTugasDetail)
router.put('/tugas/:id/mulai',    petugas.mulaiPenanganan)
router.post('/tugas/:id/selesai', upload.single('foto_tindakan'), petugas.selesaikanTugas)

// Laporan masuk (antrian)
router.get('/laporan-masuk', petugas.getLaporanMasuk)

// Status diri
router.put('/status', petugas.updateStatusDiri)

// Notifikasi
router.get('/notifikasi',      petugas.getNotifikasi)
router.put('/notifikasi/baca', petugas.bacaNotifikasi)

router.get('/profil',        petugas.getProfil)
router.put('/profil/update', upload.single('foto_profil'), petugas.updateProfil)

module.exports = router