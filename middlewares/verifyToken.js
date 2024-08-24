const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || "your-secret-key";

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).send({
            status: "error",
            statusCode: 403,
            error: {
                code: "NO_TOKEN_PROVIDED",
                message: "No token provided.",
                details: "Please provide a valid token to access this resource.",
            },
        });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        console.log(token);
        if (err) {
            return res.status(401).send({
                status: "error",
                statusCode: 401,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Failed to authenticate token.",
                    details: "The provided token is invalid or expired.",
                },
            });
        }

        // Ensure the user ID is available
        if (!decoded.id) {
            return res.status(401).send({
                status: "error",
                statusCode: 401,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Token does not contain a valid user ID.",
                    details: "The token is missing necessary information.",
                },
            });
        }

        // Save user ID in request for use in other routes
        req.userId = decoded.id;
        next();
    });
};

module.exports = verifyToken;
