import pkg from 'jsonwebtoken';
const { verify } = pkg;
const secretKey = process.env.JWT_SECRET || 'your-secret-key';

const verifyToken = (req, res, next) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Check if the token is provided
    if (!token) {
        return res.status(403).json({
            status: 'error',
            statusCode: 403,
            error: {
                code: 'NO_TOKEN_PROVIDED',
                message: 'No token provided.',
                details: 'Please provide a valid token to access this resource.',
            },
        });
    }

    // Verify the token
    verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Failed to authenticate token.',
                    details: 'The provided token is invalid or expired.',
                },
            });
        }

        // Ensure the decoded token contains a valid user ID
        if (!decoded.id) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Token does not contain a valid user ID.',
                    details: 'The token is missing necessary information.',
                },
            });
        }

        // Save the user ID in the request object
        req.userId = decoded.id;
        next();
    });
};

export default verifyToken;
