require('dotenv').config()
const bcrypt = require('bcryptjs')
const { sequelize, User, Wilayah, KategoriPelanggaran } = require('../models')

const seed = async () => {
  try {
    console.log('🌱 Memulai seeding database...\n')

    // ============================================================
    // WILAYAH
    // ============================================================
    console.log('📍 Membuat data wilayah...')
    const wilayahData = [
      {
        nama_wilayah:    'Wilayah Palu Barat',
        kecamatan:       'Palu Barat',
        kelurahan:       'Balaroa',
        keterangan:      'Mencakup kawasan Palu Barat dan sekitarnya',
        latitude_pusat:  -0.8917,
        longitude_pusat: 119.8707,
      },
      {
        nama_wilayah:    'Wilayah Palu Timur',
        kecamatan:       'Palu Timur',
        kelurahan:       'Besusu Barat',
        keterangan:      'Mencakup kawasan Palu Timur dan sekitarnya',
        latitude_pusat:  -0.8914,
        longitude_pusat: 119.8723,
      },
      {
        nama_wilayah:    'Wilayah Palu Selatan',
        kecamatan:       'Palu Selatan',
        kelurahan:       'Birobuli Utara',
        keterangan:      'Mencakup kawasan Palu Selatan dan sekitarnya',
        latitude_pusat:  -0.9102,
        longitude_pusat: 119.8651,
      },
      {
        nama_wilayah:    'Wilayah Palu Utara',
        kecamatan:       'Palu Utara',
        kelurahan:       'Taipa',
        keterangan:      'Mencakup kawasan Palu Utara dan sekitarnya',
        latitude_pusat:  -0.8412,
        longitude_pusat: 119.8698,
      },
      {
        nama_wilayah:    'Wilayah Tatanga',
        kecamatan:       'Tatanga',
        kelurahan:       'Duyu',
        keterangan:      'Mencakup kawasan Tatanga dan sekitarnya',
        latitude_pusat:  -0.9187,
        longitude_pusat: 119.8512,
      },
      {
        nama_wilayah:    'Wilayah Mantikulore',
        kecamatan:       'Mantikulore',
        kelurahan:       'Tondo',
        keterangan:      'Mencakup kawasan Mantikulore dan sekitarnya',
        latitude_pusat:  -0.8756,
        longitude_pusat: 119.9012,
      },
      {
        nama_wilayah:    'Wilayah Ulujadi',
        kecamatan:       'Ulujadi',
        kelurahan:       'Tipo',
        keterangan:      'Mencakup kawasan Ulujadi dan sekitarnya',
        latitude_pusat:  -0.9312,
        longitude_pusat: 119.8234,
      },
      {
        nama_wilayah:    'Wilayah Tawaeli',
        kecamatan:       'Tawaeli',
        kelurahan:       'Pantoloan',
        keterangan:      'Mencakup kawasan Tawaeli dan sekitarnya',
        latitude_pusat:  -0.7823,
        longitude_pusat: 119.8912,
      },
    ]

    const wilayahList = await Wilayah.bulkCreate(wilayahData, { ignoreDuplicates: true })
    console.log(`   ✅ ${wilayahList.length} wilayah dibuat\n`)

    // ============================================================
    // KATEGORI PELANGGARAN
    // ============================================================
    console.log('⚠️  Membuat kategori pelanggaran...')
    const kategoriData = [
      {
        nama_kategori:     'Parkir di Trotoar',
        deskripsi:         'Kendaraan parkir di atas trotoar yang menghalangi pejalan kaki',
        status:            'aktif',
        prioritas_default: 'tinggi',
      },
      {
        nama_kategori:     'Parkir di Bahu Jalan',
        deskripsi:         'Kendaraan parkir di bahu jalan yang mengganggu arus lalu lintas',
        status:            'aktif',
        prioritas_default: 'sedang',
      },
      {
        nama_kategori:     'Menghalangi Akses Jalan',
        deskripsi:         'Kendaraan parkir yang memblokir jalan masuk atau keluar',
        status:            'aktif',
        prioritas_default: 'tinggi',
      },
      {
        nama_kategori:     'Parkir di Jalur Sepeda',
        deskripsi:         'Kendaraan parkir di jalur khusus sepeda',
        status:            'aktif',
        prioritas_default: 'sedang',
      },
      {
        nama_kategori:     'Double Parking',
        deskripsi:         'Kendaraan parkir di samping kendaraan lain yang sudah parkir',
        status:            'aktif',
        prioritas_default: 'sedang',
      },
      {
        nama_kategori:     'Parkir di Depan Hidran',
        deskripsi:         'Kendaraan parkir menutupi hidran pemadam kebakaran',
        status:            'aktif',
        prioritas_default: 'tinggi',
      },
      {
        nama_kategori:     'Parkir di Zona Larangan',
        deskripsi:         'Kendaraan parkir di zona yang sudah ditandai dilarang parkir',
        status:            'aktif',
        prioritas_default: 'sedang',
      },
      {
        nama_kategori:     'Parkir di Tikungan',
        deskripsi:         'Kendaraan parkir di area tikungan yang membahayakan',
        status:            'aktif',
        prioritas_default: 'tinggi',
      },
      {
        nama_kategori:     'Parkir Liar Berlapis',
        deskripsi:         'Beberapa kendaraan parkir berlapis-lapis secara ilegal',
        status:            'aktif',
        prioritas_default: 'tinggi',
      },
      {
        nama_kategori:     'Parkir di Depan Rambu',
        deskripsi:         'Kendaraan menutupi rambu lalu lintas',
        status:            'aktif',
        prioritas_default: 'rendah',
      },
    ]

    const kategoriList = await KategoriPelanggaran.bulkCreate(kategoriData, { ignoreDuplicates: true })
    console.log(`   ✅ ${kategoriList.length} kategori dibuat\n`)

    // ============================================================
    // AKUN ADMIN
    // ============================================================
    console.log('👤 Membuat akun admin...')
    const adminData = [
      {
        nama:           'Dishub Admin Pusat',
        email:          'admin@siapparkir.id',
        password:       await bcrypt.hash('Admin2026!', 10),
        no_hp:          '081234567890',
        role:           'admin',
        status_akun:    'aktif',
        kode_user:      'ADM-001',
        id_wilayah:     null,
      },
      {
        nama:           'Supervisor Dishub',
        email:          'supervisor@siapparkir.id',
        password:       await bcrypt.hash('Super2026!', 10),
        no_hp:          '081234567891',
        role:           'admin',
        status_akun:    'aktif',
        kode_user:      'ADM-002',
        id_wilayah:     null,
      },
    ]

    for (const admin of adminData) {
      const existing = await User.findOne({ where: { email: admin.email } })
      if (!existing) {
        await User.create(admin)
        console.log(`   ✅ Admin: ${admin.email} | Password: ${admin.email === 'admin@siapparkir.id' ? 'Admin2026!' : 'Super2026!'}`)
      } else {
        console.log(`   ⚠️  Admin ${admin.email} sudah ada, dilewati`)
      }
    }

    // ============================================================
    // AKUN PETUGAS
    // ============================================================
    console.log('\n👮 Membuat akun petugas...')

    // Ambil wilayah yang sudah dibuat
    const wilayah = await Wilayah.findAll()
    const getWilayahId = (nama) => wilayah.find(w => w.nama_wilayah.includes(nama))?.id_wilayah || null

    const petugasData = [
      {
        nama:           'Agus Setiawan',
        email:          'agus.setiawan@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111111',
        nip:            '196501012000011001',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'aktif',
        kode_user:      'PTG-001',
        id_wilayah:     getWilayahId('Palu Barat'),
      },
      {
        nama:           'Rian Hidayat',
        email:          'rian.hidayat@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111112',
        nip:            '196501022000011002',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'istirahat',
        kode_user:      'PTG-002',
        id_wilayah:     getWilayahId('Palu Barat'),
      },
      {
        nama:           'Siti Aminah',
        email:          'siti.aminah@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111113',
        nip:            '196501032000012001',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'aktif',
        kode_user:      'PTG-003',
        id_wilayah:     getWilayahId('Palu Timur'),
      },
      {
        nama:           'Bambang Pamungkas',
        email:          'bambang.p@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111114',
        nip:            '196501042000011003',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'off',
        kode_user:      'PTG-004',
        id_wilayah:     getWilayahId('Palu Selatan'),
      },
      {
        nama:           'Dedi Kurniawan',
        email:          'dedi.k@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111115',
        nip:            '196501052000011004',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'aktif',
        kode_user:      'PTG-005',
        id_wilayah:     getWilayahId('Palu Utara'),
      },
      {
        nama:           'Fitri Handayani',
        email:          'fitri.h@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111116',
        nip:            '196501062000012002',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'aktif',
        kode_user:      'PTG-006',
        id_wilayah:     getWilayahId('Tatanga'),
      },
      {
        nama:           'Hendra Wijaya',
        email:          'hendra.w@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111117',
        nip:            '196501072000011005',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'aktif',
        kode_user:      'PTG-007',
        id_wilayah:     getWilayahId('Mantikulore'),
      },
      {
        nama:           'Indah Permata',
        email:          'indah.p@siapparkir.id',
        password:       await bcrypt.hash('Petugas2026!', 10),
        no_hp:          '082111111118',
        nip:            '196501082000012003',
        role:           'petugas',
        status_akun:    'aktif',
        status_petugas: 'aktif',
        kode_user:      'PTG-008',
        id_wilayah:     getWilayahId('Ulujadi'),
      },
    ]

    for (const petugas of petugasData) {
      const existing = await User.findOne({ where: { email: petugas.email } })
      if (!existing) {
        await User.create(petugas)
        console.log(`   ✅ Petugas: ${petugas.nama} | Wilayah: ${petugas.id_wilayah || '-'}`)
      } else {
        console.log(`   ⚠️  Petugas ${petugas.nama} sudah ada, dilewati`)
      }
    }

    // ============================================================
    // RINGKASAN
    // ============================================================
    console.log('\n' + '='.repeat(55))
    console.log('✅ SEEDING SELESAI!')
    console.log('='.repeat(55))
    console.log('\n📋 AKUN YANG DIBUAT:')
    console.log('\n  ADMIN:')
    console.log('  ┌─────────────────────────────────────────┐')
    console.log('  │ Email    : admin@siapparkir.id           │')
    console.log('  │ Password : Admin2026!                    │')
    console.log('  ├─────────────────────────────────────────┤')
    console.log('  │ Email    : supervisor@siapparkir.id      │')
    console.log('  │ Password : Super2026!                    │')
    console.log('  └─────────────────────────────────────────┘')
    console.log('\n  PETUGAS (semua password sama):')
    console.log('  ┌─────────────────────────────────────────┐')
    console.log('  │ Password : Petugas2026!                  │')
    console.log('  │ Contoh   : agus.setiawan@siapparkir.id  │')
    console.log('  └─────────────────────────────────────────┘')
    console.log('\n🗺️  Wilayah: 8 wilayah Kota Palu')
    console.log('⚠️  Kategori: 10 kategori pelanggaran')
    console.log('='.repeat(55) + '\n')

    process.exit(0)
  } catch (err) {
    console.error('\n❌ Seeding gagal:', err.message)
    console.error(err)
    process.exit(1)
  }
}

// Koneksi DB lalu jalankan seed
sequelize.authenticate()
  .then(() => seed())
  .catch(err => {
    console.error('❌ Gagal koneksi DB:', err.message)
    process.exit(1)
  })