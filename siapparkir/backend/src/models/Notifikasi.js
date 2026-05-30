const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notifikasi = sequelize.define('Notifikasi', {
  id_notifikasi: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_user:       { type: DataTypes.INTEGER },
  id_laporan:    { type: DataTypes.INTEGER },
  judul:         { type: DataTypes.STRING(200) },
  pesan:         { type: DataTypes.TEXT },
  status_baca:   { type: DataTypes.ENUM('belum', 'sudah'), defaultValue: 'belum' },
  created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'notifikasi', timestamps: false });

module.exports = Notifikasi;