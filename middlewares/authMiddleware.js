const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key'; // Replace with your actual secret key

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).send({
            status: "error",
            statusCode: 401,
            error: {
                code: "NO_TOKEN_PROVIDED",
                message: "No token provided.",
                details: "Please provide a valid token to access this resource.",
            },
        });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).send({
                status: "error",
                statusCode: 403,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid token.",
                    details: "The provided token is invalid or expired.",
                },
            });
        }

        req.user = user;
        next();
    });
};


module.exports = {
    authenticateToken
};