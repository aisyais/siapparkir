const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { User } = require('../models');
const { ok, fail } = require('../utils/response');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email dan password wajib diisi');

    const user = await User.findOne({ where: { email, status_akun: 'aktif' } });
    if (!user) return fail(res, 'Email atau password salah', 401);
    if (user.role === 'masyarakat') return fail(res, 'Akses ditolak', 403);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail(res, 'Email atau password salah', 401);

    const token = jwt.sign(
      { id_user: user.id_user, nama: user.nama, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return ok(res, {
      token,
      user: { id_user: user.id_user, nama: user.nama, role: user.role, foto_profil: user.foto_profil },
    }, 'Login berhasil');
  } catch (err) {
    console.error(err);
    return fail(res, 'Server error', 500);
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id_user, { attributes: { exclude: ['password'] } });
    return ok(res, user);
  } catch {
    return fail(res, 'Server error', 500);
  }
};