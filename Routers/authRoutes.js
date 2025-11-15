const express = require('express');
const { register, login, getMe, logout } = require('../Controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;