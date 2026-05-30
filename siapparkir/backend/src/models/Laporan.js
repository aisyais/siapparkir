const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Laporan = sequelize.define('Laporan', {
  id_laporan:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pelapor:           { type: DataTypes.INTEGER },
  id_petugas:           { type: DataTypes.INTEGER },
  id_kategori:          { type: DataTypes.INTEGER },
  nomor_plat:           { type: DataTypes.STRING(15) },
  alamat:               { type: DataTypes.TEXT },
  deskripsi:            { type: DataTypes.TEXT },
  foto_bukti:           { type: DataTypes.STRING(255) },
  status_laporan: {
    type: DataTypes.ENUM(
      'menunggu_verifikasi','diverifikasi','ditolak',
      'ditugaskan','dalam_penanganan','tidak_ditemukan','ditindak','selesai'
    ),
    defaultValue: 'menunggu_verifikasi'
  },
  sumber_laporan:       { type: DataTypes.STRING(50) },
  alasan_penolakan:     { type: DataTypes.TEXT },
  waktu_laporan:        { type: DataTypes.DATE },
  created_at:           { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at:           { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  latitude:             { type: DataTypes.DECIMAL(10, 8) },
  longitude:            { type: DataTypes.DECIMAL(11, 8) },
  alamat_otomatis:      { type: DataTypes.TEXT },
  detail_alamat:        { type: DataTypes.TEXT },
  akurasi_lokasi:       { type: DataTypes.DECIMAL(8, 2) },
  jenis_kendaraan:      { type: DataTypes.STRING(50) },
  kode_laporan:         { type: DataTypes.STRING(30), unique: true },
  prioritas:            { type: DataTypes.ENUM('rendah', 'sedang', 'tinggi'), defaultValue: 'sedang' },
  is_duplikat:          { type: DataTypes.TINYINT(1), defaultValue: 0 },
  id_laporan_duplikat:  { type: DataTypes.INTEGER },
  skor_duplikat:        { type: DataTypes.DECIMAL(5, 2) },
  trust_score:          { type: DataTypes.DECIMAL(5, 2) },
}, { 
  tableName: 'laporan', 
  timestamps: false,
  freezeTableName: true // TAMBAHKAN INI
});

module.exports = Laporan;