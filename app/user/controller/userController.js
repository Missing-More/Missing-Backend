import pkg from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const { sign } = pkg;
const { hashSync, compareSync } = bcrypt;
import validators from "../../../utils/validators.js";

// Destructure the functions from the imported object
const { isValidEmail, isPasswordStrong } = validators;

import User from "../../../models/userModel.js";

// Define your secret key securely
const secretKey = process.env.JWT_SECRET || "your-secret-key";

// Register a new User
export async function registerUser(req, res) {
    const { email, password } = req.body;

    // Validate the request data
    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            statusCode: 400,
            error: {
                code: "EMPTY_ENTRY",
                message: "Email and password cannot be empty!",
                details: "Both email and password fields are required for registration.",
                path: "users/register",
            },
        });
    }

    // Verify email format
    if (!isValidEmail(email)) {
        return res.status(400).json({
            status: "error",
            statusCode: 400,
            error: {
                code: "INVALID_EMAIL",
                message: "Invalid email format.",
                details: "Please provide a valid email address.",
                path: "users/register",
            },
        });
    }

    // Check password strength
    if (!isPasswordStrong(password)) {
        return res.status(400).json({
            status: "error",
            statusCode: 400,
            error: {
                code: "WEAK_PASSWORD",
                message: "Password is not strong enough.",
                details: "Password must be at least 6 characters long and include a mix of letters and numbers.",
                path: "users/register",
            },
        });
    }

    try {
        // Hash the password
        const hashedPassword = hashSync(password, 8);

        // Create the user object
        const user = {
            email,
            password: hashedPassword
        };

        // Save user to the database
        const data = await User.createUser(user);

        // Respond with the user info and token
        res.status(201).json({
            data: {
                user_id: data.user_id,
                email: data.email,
                name: data.name,
                phone: data.phone,
                created_at: data.created_at,
                account_type: data.account_type,
                accessToken: sign({ id: data.user_id }, secretKey, {
                    expiresIn: "48h", // 48 hours
                }),
            },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            status: "error",
            statusCode: 500,
            error: {
                code: "UNKNOWN_ERROR",
                message: "An unexpected error occurred while registering the user.",
                details: "Please try again later.",
                path: "users/register",
            },
        });
    }
}

// Login a User
export async function loginUser(req, res) {
    const { email, password } = req.body;

    // Validate the request data
    if (!email || !password) {
        return res.status(400).json({
            status: "error",
            statusCode: 400,
            error: {
                code: "EMPTY_ENTRY",
                message: "Email and password cannot be empty!",
                details: "Both email and password fields are required for login.",
                path: "users/login",
            },
        });
    }

    // Verify email format
    if (!isValidEmail(email)) {
        return res.status(400).json({
            status: "error",
            statusCode: 400,
            error: {
                code: "INVALID_EMAIL",
                message: "Invalid email format.",
                details: "Please provide a valid email address.",
                path: "users/login",
            },
        });
    }

    try {
        // Find user by email
        const user = await User.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                status: "error",
                statusCode: 404,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found.",
                    details: "No user found with the provided email address.",
                },
            });
        }

        // Check if the password is correct
        const passwordIsValid = compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).json({
                status: "error",
                statusCode: 401,
                error: {
                    code: "INVALID_PASSWORD",
                    message: "Invalid password.",
                    details: "The password provided is incorrect.",
                },
            });
        }

        // Generate a token
        const token = sign({ id: user.user_id }, secretKey, {
            expiresIn: "24h", // 24 hours
        });

        res.status(200).json({
            data: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile_image_url: user.profile_image_url,
                account_type: user.account_type,
                created_at: user.created_at,
                accessToken: token
            },
        });
    } catch (err) {
        console.error("Error logging in user:", err);
        res.status(err.statusCode || 500).json({
            status: "error",
            statusCode: err.statusCode || 500,
            error: {
                code: "UNKNOWN_ERROR",
                message: "An unexpected error occurred while logging in.",
                details: "Please try again later.",
                path: "users/login",
            },
        });
    }
}

// Get user info
export async function getUserInfo(req, res) {
    try {
        const userId = req.params.userId; // Get user ID from the params

        // Find user by ID
        const user = await User.getUser(userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                statusCode: 404,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found.",
                    details: "No user found with the provided ID.",
                },
            });
        }

        // Send user info
        res.status(200).json({
            id: user.user_id,
            email: user.email,
            name: user.name,
            is_premium: user.is_premium,
            phone: user.phone,
            profile_image_url: user.profile_image_url,
        });
    } catch (err) {
        console.error("Error retrieving user info:", err);
        res.status(500).json({
            status: "error",
            statusCode: 500,
            error: {
                code: "ERROR_RETRIEVING_USER",
                message: "An error occurred while retrieving the user information.",
                details: "Please try again later.",
            },
        });
    }
}
