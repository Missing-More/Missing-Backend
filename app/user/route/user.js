const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authenticateToken = require('../../middlewares/authMiddleware');
const verifyToken = require('../../middlewares/verifyToken');


router.get('/:userId', verifyToken, userController.getUserInfo);

router.post('/register', userController.registerUser);

router.post('/login', userController.loginUser);


module.exports = router;
