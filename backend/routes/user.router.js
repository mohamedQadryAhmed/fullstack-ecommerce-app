import express from 'express';
import {
  createUser,
  loginUser,
  logoutUser,
  getUsers,
  getCurrentUserProfile,
  updateUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
} from '../controllers/user.controllers.js';
import { authenticate, authAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.route('/').post(createUser).get(authenticate, authAdmin, getUsers);

// Login a user
router.post('/login', loginUser);

// Get current user profile
router
  .route('/profile')
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateUserProfile);

router
  .route('/:id')
  .delete(authenticate, authAdmin, deleteUserById)
  .get(authenticate, authAdmin, getUserById)
  .put(authenticate, authAdmin, updateUserById);

// Logout a user
router.post('/logout', logoutUser);

export default router;
