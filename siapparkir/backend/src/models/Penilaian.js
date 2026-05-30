const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Penilaian = sequelize.define('Penilaian', {
  id_penilaian: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_laporan:   { type: DataTypes.INTEGER },
  id_user:      { type: DataTypes.INTEGER },
  rating:       { type: DataTypes.INTEGER },
  komentar:     { type: DataTypes.TEXT },
  created_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'penilaian', timestamps: false });

module.exports = Penilaian;