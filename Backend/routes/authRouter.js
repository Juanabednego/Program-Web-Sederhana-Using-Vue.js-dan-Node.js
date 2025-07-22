import express from "express"
import User from "../models/userModel.js"
import asyncHandler from "../middleware/asyncHandler.js"
import { deleteUserById, getAllUser, getCurrentUser, getUserById, loginUser, logoutUser, registerUser, updateUser } from "../controllers/authController.js"
import { protectedMiddleware } from "../middleware/authMiddleware.js"


const router = express.Router()

// post /api/v1/auth/register
router.post('/register', registerUser)

// post /api/v1/auth/login
router.post('/login', loginUser)

// get /api/v1/auth/logout
router.get('/logout', protectedMiddleware, logoutUser)

// get /api/v1/auth/getUser
router.get('/getuser', protectedMiddleware, getCurrentUser)

// GET /api/v1/auth/user/:id
router.get('/:id', protectedMiddleware, getUserById);

router.delete('/:id', protectedMiddleware, deleteUserById);

router.patch('/update', protectedMiddleware, updateUser);

router.get('/', protectedMiddleware, getAllUser)

export default router