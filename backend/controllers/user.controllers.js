import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import asyncHandler from '../middlewares/asyncHandler.js';
import { success, fail, error } from '../utils/JSendFormat.js';
import generateToken from '../utils/generateToken.js';

// Create a new user
const createUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json(fail({ message: 'Username, email, and password are required.' }));
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(fail({ message: 'Email already exists with this email.' }));
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    // Generate a token for the user
    generateToken(res, newUser._id);

    return res.status(201).json(
      success({
        message: 'User created successfully',
        user: {
          username,
          email,
        },
      })
    );
  } catch (e) {
    return res.status(500).json(error(e.message, e.stack));
  }
});

// Login a user
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json(fail({ message: 'Email and password are required.' }));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(fail({ message: 'Invalid email.' }));
    }

    // Check if password is correct
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json(fail({ message: 'Invalid password.' }));
    }

    // Generate a token for the user
    generateToken(res, user._id);
    return res.status(200).json(
      success({
        message: 'Login successful',
        user: {
          username: user.username,
          email: user.email,
        },
      })
    );
  } catch (e) {
    res.status(500).json(error(e.message, e.stack));
  }
});

// Logout a user
const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    return res.status(200).json(success({ message: 'Logout successful' }));
  } catch (e) {
    return res.status(500).json(error(e.message, e.stack));
  }
});

// Get all users (Admin only)
const getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password from response
    return res.status(200).json(success({ users }));
  } catch (e) {
    return res.status(500).json(error(e.message, e.stack));
  }
});

// Get current user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json(fail({ message: 'User not found.' }));
    }
    return res.status(200).json(success({ user }));
  } catch (e) {
    return res.status(500).json(error(e.message, e.stack));
  }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json(fail({ message: 'User not found.' }));
    }

    const { username, email, password } = req.body;
    if (username) user.username = username;
    if (email) {
      // Check if email is already used by another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json(fail({ message: 'Email already exists.' }));
      }
      user.email = email;
    }

    if (password) {
      // Hash the new password
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    return res.status(200).json(
      success({
        message: 'User profile updated successfully',
        user: {
          username: user.username,
          email: user.email,
        },
      })
    );
  } catch (e) {
    res.status(500).json(error(e.message, e.stack));
  }
});

// Delete user by ID (Admin only)
const deleteUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(fail({ message: 'User not found.' }));
    }

    if (user.isAdmin) {
      return res
        .status(400)
        .json(fail({ message: 'Cannot delete an admin user.' }));
    }

    await User.deleteOne({ _id: user._id });
    return res
      .status(200)
      .json(success({ message: 'User deleted successfully.' }));
  } catch (e) {
    res.status(500).json(error(e.message, e.stack));
  }
});

// Get user by ID (Admin only)
const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json(fail({ message: 'User not found.' }));
    }
    return res.status(200).json(success({ user }));
  } catch (e) {
    return res.status(500).json(error(e.message, e.stack));
  }
});

// Update user by ID (Admin only)
const updateUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(fail({ message: 'User not found.' }));
    }
    const { username, email, isAdmin } = req.body;
    if (username) user.username = username;
    if (email) {
      // Check if email is already used by another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json(fail({ message: 'Email already exists.' }));
      }
      user.email = email;
    }
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    await user.save();
    return res.status(200).json(
      success({
        message: 'User updated successfully',
        user: {
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      })
    );
  } catch (e) {
    return res.status(500).json(error(e.message, e.stack));
  }
});

export {
  createUser,
  loginUser,
  logoutUser,
  getUsers,
  getCurrentUserProfile,
  updateUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};
