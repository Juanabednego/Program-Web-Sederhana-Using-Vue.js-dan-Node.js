// backend/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    console.log('--- [AuthMiddleware] Entering protectedMiddleware ---');

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('[AuthMiddleware] Token found in Authorization header.');
    }
    // Check for token in cookies (if you're also using cookies for auth)
    else if (req.cookies.jwt) {
        token = req.cookies.jwt;
        console.log('[AuthMiddleware] Token found in cookies.');
    }

    if (token) {
        try {
            console.log('[AuthMiddleware] Attempting to verify token...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[AuthMiddleware] Token successfully decoded. User ID:', decoded.id);

            req.user = await User.findById(decoded.id).select('-password'); // Exclude password
            
            if (!req.user) {
                console.error('[AuthMiddleware] User not found for decoded ID:', decoded.id);
                res.status(401);
                throw new Error('Pengguna tidak ditemukan, token tidak valid.');
            }
            console.log(`[AuthMiddleware] User authenticated: ${req.user.username} (ID: ${req.user._id})`);
            next(); // Proceed to the next middleware/route handler
        } catch (e) {
            console.error('[AuthMiddleware] Auth Error (Token Invalid/Expired/Verification Failed):');
            console.error('  Message:', e.message);
            console.error('  Stack:', e.stack); // Print full stack trace for detailed debugging
            res.status(401);
            throw new Error('Tidak Diotorisasi, token tidak valid atau kedaluwarsa.');
        }
    } else {
        console.warn('[AuthMiddleware] No token provided in headers or cookies.');
        res.status(401);
        throw new Error('Tidak Diotorisasi, tidak ada token.');
    }
    console.log('--- [AuthMiddleware] Exiting protectedMiddleware ---'); // Will only hit if no error before
});

// Middleware untuk otorisasi berdasarkan role
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log(`[AuthMiddleware] Checking user roles: ${req.user?.role} against required roles: ${roles.join(', ')}`);
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            console.warn('[AuthMiddleware] Authorization failed: User role does not match required roles.');
            res.status(403); // Forbidden
            throw new Error('Anda tidak memiliki izin untuk mengakses rute ini.');
        }
        console.log('[AuthMiddleware] Authorization successful: User has required role.');
        next();
    };
};

// ADMIN MIDDLEWARE
export const adminMiddleware = asyncHandler(async (req, res, next) => {
    console.log('--- [AuthMiddleware] Entering adminMiddleware ---');
    console.log('[AuthMiddleware] User role for admin check:', req.user?.role);

    if (req.user && req.user.role === 'admin') {
        console.log('[AuthMiddleware] User is an admin. Proceeding.');
        next();
    } else {
        console.warn('[AuthMiddleware] Authorization failed: User is not an admin.');
        res.status(403); // Forbidden
        throw new Error('Tidak diotorisasi: Anda tidak memiliki izin Admin.');
    }
    console.log('--- [AuthMiddleware] Exiting adminMiddleware ---');
});