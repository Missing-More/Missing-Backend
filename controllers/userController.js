const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { isValidEmail, isPasswordStrong } = require("../utils/validators");

// Define your secret key securely
const secretKey = process.env.JWT_SECRET || "your-secret-key";

// Create and Save a new User
exports.registerUser = async (req, res) => {
    // Validate request
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            status: "error",
            statusCode: 400,
            error: {
                code: "EMPTY_ENTRY",
                message: "Email and password cannot be empty!",
                details: "The email and password fields cannot be empty. Please provide a valid email and password to register a new user.",
                path: "users/register",
            },
        });
    }

    // Verify email format
    if (!isValidEmail(email)) {
        return res.status(400).send({
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

    if (!isPasswordStrong(password)) {
        return res.status(400).send({
            status: "error",
            statusCode: 400,
            error: {
                code: "WEAK_PASSWORD",
                message: "Password is not strong enough.",
                details: "Password must be at least 6 characters long.",
                path: "users/register",
            },
        });
    }

    try {
        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Create a User
        const user = {
            email: email,
            password: hashedPassword,
        };

        // Save User in the database
        const data = await User.create(user);
        res.status(201).send(data);
    } catch (err) {
        res.status(err.statusCode || 500).send(err);
    }
};

// Login a User
exports.loginUser = async (req, res) => {
    // Validate request
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            status: "error",
            statusCode: 400,
            error: {
                code: "EMPTY_ENTRY",
                message: "Email and password cannot be empty!",
                details: "The email and password fields cannot be empty. Please provide a valid email and password to login.",
                path: "users/login",
            },
        });
    }

    // Verify email format
    if (!isValidEmail(email)) {
        return res.status(400).send({
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
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).send({
                status: "error",
                statusCode: 404,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found.",
                    details: "User not found. Please register as a new user.",
                },
            });
        }

        // Check if password is valid
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                status: "error",
                statusCode: 401,
                error: {
                    code: "INVALID_PASSWORD",
                    message: "Invalid password.",
                    details: "Please provide a valid password.",
                },
            });
        }

        // Generate a token
        const token = jwt.sign({ id: user.user_id }, secretKey, {
            expiresIn: 864000, // 24 hours
        });

        res.status(200).send({
            id: user.user_id,
            email: user.email,
            accessToken: token,
        });
    } catch (err) {
        res.status(err.statusCode || 500).send(err);
    }
};

// Get user info
exports.getUserInfo = async (req, res) => {
    try {
        // Get user ID from request parameters or from the token
        const userId = req.userId;

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "error",
                statusCode: 404,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found.",
                    details: "The specified user ID does not exist. Please provide a valid user ID.",
                },
            });
        }

        // Send user info
        res.status(200).send({
            id: user.user_id,
            email: user.email,
            first_name: user.first_name,  // Assuming these fields exist
            last_name: user.last_name,
            is_premium: user.is_premium,
            phone: user.phone,
            profile_image_url: user.profile_image_url,
        });
    } catch (err) {
        console.error("Error retrieving user info:", err);
        res.status(500).send({
            status: "error",
            statusCode: 500,
            error: {
                code: "ERROR_RETRIEVING_USER",
                message: "An error occurred while retrieving the user information.",
                details: "Please try again later.",
            },
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        // Get user ID from request parameters
        const userId = req.body.id;

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({
                status: "error",
                statusCode: 404,
                error: {
                    code: "USER_NOT_FOUND",
                    message: "User not found.",
                    details: "The specified user ID does not exist. Please provide a valid user ID.",
                },
            });
        }

        // Send user info
        res.status(200).send({
            id: user.user_id,
            first_name: user.first_name,  // Assuming these fields exist
            is_premium: user.is_premium,
            profile_image_url: user.profile_image_url,
        });
    } catch (err) {
        console.error("Error retrieving user by ID:", err);
        res.status(500).send({
            status: "error",
            statusCode: 500,
            error: {
                code: "ERROR_RETRIEVING_USER",
                message: "An error occurred while retrieving the user information.",
                details: "Please try again later.",
            },
        });
    }
};
