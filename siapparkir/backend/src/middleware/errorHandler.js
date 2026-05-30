const { fail } = require('../utils/response');

module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  fail(res, err.message || 'Internal Server Error', 500);
};