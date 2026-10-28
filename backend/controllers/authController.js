import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import JudgeInvite from "../models/JudgeInvite.js";

// Helper function to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
};

// @desc    Register a new user (Participant or Judge)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const { name, email, password, role, judgeAccessKey, specialization, bio } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and password."
            });
        }

        const selectedRole = role === "judge" ? "judge" : "participant";
        let matchedInvite = null;

        // If registering as judge, verify judge access key or single-use invite code
        if (selectedRole === "judge") {
            const submittedKey = (judgeAccessKey || "").trim().toUpperCase();

            if (!submittedKey) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a Judge Access Key or Invite Code."
                });
            }

            const masterKey = (process.env.JUDGE_ACCESS_KEY || "").toUpperCase();

            // 1. Check if it matches master admin key from backend .env
            if (masterKey && submittedKey === masterKey) {
                // Master key accepted
            } else {
                // 2. Check if it matches a valid single-use invite code from MongoDB
                matchedInvite = await JudgeInvite.findOne({ code: submittedKey, isUsed: false });

                if (!matchedInvite) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid or already used Judge Access Key."
                    });
                }
            }
        }

        // Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash the password with bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user in MongoDB
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: selectedRole,
            specialization: selectedRole === "judge" ? (specialization || "Official Contest Judge") : "",
            bio: selectedRole === "judge" ? (bio || "") : ""
        });

        // If a single-use invite code was used, mark it as used
        if (matchedInvite) {
            matchedInvite.isUsed = true;
            matchedInvite.usedByEmail = user.email;
            matchedInvite.usedAt = new Date();
            await matchedInvite.save();
        }

        // Generate token and return user details (without password)
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: `${selectedRole === "judge" ? "Judge" : "Participant"} registered successfully!`,
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

// @desc    Create a new single-use judge invite code
// @route   POST /api/auth/judge-invites
// @access  Public (or Admin in production)
export const createJudgeInvite = async (req, res, next) => {
    try {
        const customCode = req.body?.code?.trim();
        const code = customCode
            ? customCode.toUpperCase()
            : "JUDGE-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        const existing = await JudgeInvite.findOne({ code });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Invite code '${code}' already exists.`
            });
        }

        const invite = await JudgeInvite.create({ code });

        res.status(201).json({
            success: true,
            message: "Judge invite code generated successfully!",
            invite: {
                code: invite.code,
                isUsed: invite.isUsed,
                createdAt: invite.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all judge invite codes
// @route   GET /api/auth/judge-invites
// @access  Public (or Admin in production)
export const getJudgeInvites = async (req, res, next) => {
    try {
        const invites = await JudgeInvite.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: invites.length,
            invites
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password."
            });
        }

        // Find user by lowercase email
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Compare entered password with stored hash
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
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

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private (Requires token)
export const getMe = async (req, res, next) => {
    try {
        // req.user is populated by protect middleware
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        next(error);
    }
};
