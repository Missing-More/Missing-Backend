const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const verifyToken = require('../middlewares/verifyToken');

/**
 * @route POST /users/register
 * @group User - Operations about user
 * @param {string} email.body.required - User's email
 * @param {string} password.body.required - User's password
 * @returns {object} 200 - User registered successfully
 * @returns {Error}  default - Unexpected error
 */
router.post('/register', userController.registerUser);

/**
 * @route POST /users/login
 * @group User - Operations about user
 * @param {string} email.body.required - User's email
 * @param {string} password.body.required - User's password
 * @returns {object} 200 - User logged in successfully
 * @returns {Error}  default - Unexpected error
 */
router.post('/login', userController.loginUser);

/**
 * @route GET /users/getMyInfo
 * @group User - Operations about user
 * @returns {object} 200 - User info retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get('/getMyInfo', verifyToken, userController.getUserInfo);

/**
 * @route GET /users/getUserInfoById
 * @group User - Operations about user
 * @param {number} user_id.query.required - User ID
 * @returns {object} 200 - User info retrieved successfully
 * @returns {Error}  default - Unexpected error
 */
router.get('/getUserInfoById', verifyToken, userController.getUserById);



module.exports = router;
