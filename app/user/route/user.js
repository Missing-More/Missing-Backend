import { Router } from 'express'; // Import Router from express
import verifyToken from '../../middlewares/verifyToken.js'; // Add .js extension

import { getUserInfo, registerUser, loginUser } from '../controller/userController.js'; // Add .js extension for ES Modules


const router = Router(); // Initialize the router

// Route to get user info
router.get('/:userId', verifyToken, getUserInfo);

// Route to register a new user
router.post('/register', registerUser);

// Route to log in a user
router.post('/login', loginUser);

// Export the router as default
export default router;
