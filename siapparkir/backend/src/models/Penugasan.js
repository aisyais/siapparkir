const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Penugasan = sequelize.define('Penugasan', {
  id_penugasan:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_laporan:                 { type: DataTypes.INTEGER },
  id_petugas:                 { type: DataTypes.INTEGER },
  id_admin:                   { type: DataTypes.INTEGER },
  catatan_tugas:              { type: DataTypes.TEXT },
  waktu_penugasan:            { type: DataTypes.DATE },
  status_penugasan:           { type: DataTypes.STRING(50) },
  tindakan_direkomendasikan:  { type: DataTypes.STRING(100) },
  jarak_petugas_km:           { type: DataTypes.DECIMAL(6, 2) },
  batas_waktu_penanganan:     { type: DataTypes.DATE },
}, { tableName: 'penugasan', timestamps: false });

module.exports = Penugasan;