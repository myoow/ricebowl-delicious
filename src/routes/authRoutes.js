const express = require('express');
const { loginUser, registerUser } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/register
router.post('/register', registerUser);

module.exports = router;
