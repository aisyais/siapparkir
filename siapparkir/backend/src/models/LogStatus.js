const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogStatus = sequelize.define('LogStatus', {
  id_log:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_laporan:  { type: DataTypes.INTEGER },
  status_lama: { type: DataTypes.STRING(50) },
  status_baru: { type: DataTypes.STRING(50) },
  diubah_oleh: { type: DataTypes.INTEGER },
  catatan:     { type: DataTypes.TEXT },
  created_at:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'log_status', timestamps: false });

module.exports = LogStatus;