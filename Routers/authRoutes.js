const express = require('express');
const { register, login, getMe, logout } = require('../Controllers/authController');
const protect = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

module.exports = router;