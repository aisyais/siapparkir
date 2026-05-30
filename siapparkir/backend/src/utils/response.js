const ok = (res, data = null, message = 'Berhasil', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const fail = (res, message = 'Terjadi kesalahan', statusCode = 400, errors = null) =>
  res.status(statusCode).json({ success: false, message, errors });

module.exports = { ok, fail };