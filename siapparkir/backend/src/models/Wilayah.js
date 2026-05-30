const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wilayah = sequelize.define('Wilayah', {
  id_wilayah:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_wilayah:    { type: DataTypes.STRING(100) },
  kecamatan:       { type: DataTypes.STRING(100) },
  kelurahan:       { type: DataTypes.STRING(100) },
  keterangan:      { type: DataTypes.TEXT },
  latitude_pusat:  { type: DataTypes.DECIMAL(10, 8) },
  longitude_pusat: { type: DataTypes.DECIMAL(11, 8) },
}, { tableName: 'wilayah', timestamps: false });

module.exports = Wilayah;