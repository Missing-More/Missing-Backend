const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

// Create a new User
router.post('/register', userController.registerUser);

// Login a User
router.post('/login', userController.loginUser);


module.exports = router;
