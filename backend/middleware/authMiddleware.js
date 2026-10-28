import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify JWT token from Authorization header: Bearer <token>
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(" ")[1];

            // Verify token signature with JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch user from DB and attach to req.user (excluding password)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found with this token."
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Invalid or expired token."
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            message: "Not authorized. No token provided."
        });
    }
};

// Check if logged-in user has the required role ("participant" or "judge")
export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to ${role}s only.`
            });
        }
        next();
    };
};
