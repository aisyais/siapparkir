const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tindakan = sequelize.define('Tindakan', {
  id_tindakan:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_laporan:      { type: DataTypes.INTEGER },
  id_petugas:      { type: DataTypes.INTEGER },
  jenis_tindakan:  { type: DataTypes.ENUM('teguran','gembok','derek','pindah','tidak_ditemukan') },
  catatan_tindakan:{ type: DataTypes.TEXT },
  foto_tindakan:   { type: DataTypes.STRING(255) },
  waktu_mulai:     { type: DataTypes.DATE },
  waktu_selesai:   { type: DataTypes.DATE },
  created_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status_tindakan: { type: DataTypes.ENUM('draft','selesai','terverifikasi'), defaultValue: 'draft' },
}, { tableName: 'tindakan', timestamps: false });

module.exports = Tindakan;