const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authenticateToken = require('../../middlewares/authMiddleware');
const verifyToken = require('../../middlewares/verifyToken');

/**
 * @route POST /users/register
 * @param {string} email.body.required - User's email
 * @param {string} password.body.required - User's password
 */
router.post('/register', userController.registerUser);

/**
 * @route POST /users/login
 * @param {string} email.body.required - User's email
 * @param {string} password.body.required - User's password
 */
router.post('/login', userController.loginUser);

/**
 * @route GET /users/getMyInfo
 * @group User - Operations about user
 */
router.get('/getMyInfo', verifyToken, userController.getUserInfo);

/**
 * @route GET /users/getUserInfoById
 * @param {number} user_id.query.required - User ID
 */
router.get('/getUserInfoById', verifyToken, userController.getUserById);



module.exports = router;
