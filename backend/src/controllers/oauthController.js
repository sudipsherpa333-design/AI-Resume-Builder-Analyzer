const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// OAuth Success Handler
exports.oauthSuccess = async (req, res) => {
    try {
        const token = generateToken(req.user._id);

        res.json({
            success: true,
            token,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                avatar: req.user.avatar
            },
            message: 'Login successful via OAuth'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'OAuth authentication failed'
        });
    }
};

// OAuth Failure Handler
exports.oauthFailure = (req, res) => {
    res.status(401).json({
        success: false,
        message: 'OAuth authentication failed'
    });
};