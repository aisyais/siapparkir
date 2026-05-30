const router = require('express').Router();
const upload = require('../middleware/upload.middleware');

// Gunakan nama variabel yang konsisten (di sini saya menggunakan 'laporan')
const laporan = require('../controllers/laporan.controller');

router.post('/laporan', upload.single('foto_bukti'), laporan.buatLaporan);
router.get('/laporan/cek', laporan.cekStatus);
router.get('/kategori', laporan.getKategori);

// Cukup definisikan satu kali saja dan gunakan variabel 'laporan' 
// yang sudah di-require di atas
router.post('/penilaian', laporan.kirimPenilaian);

module.exports = router;