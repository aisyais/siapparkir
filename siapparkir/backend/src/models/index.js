const sequelize            = require('../config/database');
const User                 = require('./User');
const Wilayah              = require('./Wilayah');
const KategoriPelanggaran  = require('./KategoriPelanggaran');
const Laporan              = require('./Laporan');
const Penugasan            = require('./Penugasan');
const Tindakan             = require('./Tindakan');
const LogStatus            = require('./LogStatus');
const Notifikasi           = require('./Notifikasi');
const Penilaian            = require('./Penilaian');

// Relasi
User.belongsTo(Wilayah, { foreignKey: 'id_wilayah', as: 'wilayah' });
Wilayah.hasMany(User,   { foreignKey: 'id_wilayah' });

Laporan.belongsTo(User,                { foreignKey: 'id_pelapor', as: 'pelapor' });
Laporan.belongsTo(User,                { foreignKey: 'id_petugas', as: 'petugas' });
Laporan.belongsTo(KategoriPelanggaran, { foreignKey: 'id_kategori', as: 'kategori' });
Laporan.hasMany(LogStatus,  { foreignKey: 'id_laporan', as: 'log' });
Laporan.hasMany(Penugasan,  { foreignKey: 'id_laporan', as: 'penugasan' });
Laporan.hasMany(Tindakan,   { foreignKey: 'id_laporan', as: 'tindakan' });

Penugasan.belongsTo(Laporan, { foreignKey: 'id_laporan' });
Penugasan.belongsTo(User,    { foreignKey: 'id_petugas', as: 'petugas' });
Penugasan.belongsTo(User,    { foreignKey: 'id_admin',   as: 'admin' });

Tindakan.belongsTo(Laporan, { foreignKey: 'id_laporan' });
Tindakan.belongsTo(User,    { foreignKey: 'id_petugas', as: 'petugas' });

LogStatus.belongsTo(Laporan, { foreignKey: 'id_laporan' });
LogStatus.belongsTo(User,    { foreignKey: 'diubah_oleh', as: 'pengubah' });

Notifikasi.belongsTo(User,    { foreignKey: 'id_user' });
Notifikasi.belongsTo(Laporan, { foreignKey: 'id_laporan' });

Penilaian.belongsTo(Laporan, { foreignKey: 'id_laporan' });
Penilaian.belongsTo(User,    { foreignKey: 'id_user' });

module.exports = {
  sequelize,
  User, Wilayah, KategoriPelanggaran,
  Laporan, Penugasan, Tindakan,
  LogStatus, Notifikasi, Penilaian,
};