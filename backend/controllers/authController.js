
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Register a new participant or judge
export const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role,
            judgeAccessKey,
            specialization,
            bio
        } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and password."
            });
        }

        // Prepare email and role
        const userEmail = email.trim().toLowerCase();

        let userRole = "participant";

        if (role === "judge") {
            userRole = "judge";
        }

        // Check judge access key
        if (userRole === "judge") {
            const enteredKey = (judgeAccessKey || "").trim().toUpperCase();
            const masterKey = (process.env.JUDGE_ACCESS_KEY || "JUDGE2026").trim().toUpperCase();

            if (!enteredKey) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide the Judge Access Key."
                });
            }

            if (!masterKey || enteredKey !== masterKey) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Judge Access Key."
                });
            }
        }

        // Check whether email already exists
        const existingUser = await User.findOne({
            email: userEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare judge profile fields
        let userSpecialization = "";
        let userBio = "";

        if (userRole === "judge") {
            userSpecialization = specialization || "Official Contest Judge";
            userBio = bio || "";
        }

        // Save user in MongoDB
        const user = await User.create({
            name: name.trim(),
            email: userEmail,
            password: hashedPassword,
            role: userRole,
            specialization: userSpecialization,
            bio: userBio
        });

        // Prepare success message
        let message = "Participant registered successfully!";

        if (userRole === "judge") {
            message = "Judge registered successfully!";
        }

        // Send response to frontend
        return res.status(201).json({
            success: true,
            message: message,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                bio: user.bio
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login an existing user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password."
            });
        }

        // Find user by email
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        // Check user and password
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Send response to frontend
        return res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                specialization: user.specialization,
                bio: user.bio
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get the currently logged-in user's profile
export const getMe = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};

// Backward-compatible stubs for judge invite routes
export const createJudgeInvite = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Judge registration uses master key (JUDGE_ACCESS_KEY)."
    });
};

export const getJudgeInvites = async (req, res) => {
    return res.status(200).json({
        success: true,
        invites: []
    });
};
