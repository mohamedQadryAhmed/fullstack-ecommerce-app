import jwt from 'jsonwebtoken';

const generateToken = (res, userID) => {
  // Create a JWT token
  const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set the token in the cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'Strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
