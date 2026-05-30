const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', auth.login);
router.get('/me',     verifyToken, auth.me);

module.exports = router;