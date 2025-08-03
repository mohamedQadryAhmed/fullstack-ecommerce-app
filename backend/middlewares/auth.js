import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.model.js';
import { fail, error } from '../utils/JSendFormat.js';

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json(fail({ message: 'Not authorized, no token' }));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res
      .status(401)
      .json(error('Not authorized, token failed', err.stack));
  }
});

const authAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res
      .status(403)
      .json(fail({ message: 'Not authorized as an admin' }));
  }
});

export { authenticate, authAdmin };
