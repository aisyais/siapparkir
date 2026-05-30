const { fail } = require('../utils/response');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return fail(res, 'Akses ditolak', 403);
  next();
};

module.exports = { requireRole };