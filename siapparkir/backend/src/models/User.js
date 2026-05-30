const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id_user:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama:           { type: DataTypes.STRING(100), allowNull: false },
  email:          { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password:       { type: DataTypes.STRING(255), allowNull: false },
  no_hp:          { type: DataTypes.STRING(15) },
  id_wilayah:     { type: DataTypes.INTEGER },
  role:           { type: DataTypes.ENUM('masyarakat', 'petugas', 'admin'), allowNull: false },
  status_akun:    { type: DataTypes.ENUM('aktif', 'nonaktif'), defaultValue: 'aktif' },
  created_at:     { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  foto_profil:    { type: DataTypes.STRING(255) },
  kode_user:      { type: DataTypes.STRING(30) },
  nip:            { type: DataTypes.STRING(50) },
  status_petugas: { type: DataTypes.ENUM('aktif', 'istirahat', 'off') },
}, { tableName: 'users', timestamps: false });

module.exports = User;