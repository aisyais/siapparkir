const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KategoriPelanggaran = sequelize.define('KategoriPelanggaran', {
  id_kategori:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_kategori:     { type: DataTypes.STRING(100), allowNull: false },
  deskripsi:         { type: DataTypes.TEXT },
  status:            { type: DataTypes.ENUM('aktif', 'nonaktif'), defaultValue: 'aktif' },
  prioritas_default: { type: DataTypes.ENUM('rendah', 'sedang', 'tinggi'), defaultValue: 'sedang' },
}, { tableName: 'kategori_pelanggaran', timestamps: false });

module.exports = KategoriPelanggaran;