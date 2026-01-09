// utils/jwtToken.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const generateAuthTokens = (user) => {
    const accessToken = generateToken(user._id);
    const refreshToken = jwt.sign(
        { userId: user._id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
};