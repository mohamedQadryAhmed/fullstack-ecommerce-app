import express from 'express';
import {
  createUser,
  loginUser,
  logoutUser,
  getUsers,
} from '../controllers/user.controllers.js';
import { authenticate, authAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Create a new user
router.route('/').post(createUser).get(authenticate, authAdmin, getUsers);

// Login a user
router.post('/login', loginUser);

// Logout a user
router.post('/logout', logoutUser);

export default router;
