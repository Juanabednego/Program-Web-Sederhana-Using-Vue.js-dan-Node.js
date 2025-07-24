import express from "express"
import User from "../models/userModel.js"
import asyncHandler from "../middleware/asyncHandler.js"
import { deleteUserById, getAllUser, getCurrentUser, getUserById, loginUser, logoutUser, registerUser, updateUser } from "../controllers/authController.js"
import { protectedMiddleware } from "../middleware/authMiddleware.js"


const router = express.Router()

router.post('/register', registerUser)

router.post('/login', loginUser)

router.get('/logout', protectedMiddleware, logoutUser)

router.get('/getuser', protectedMiddleware, getCurrentUser)

router.get('/:id', protectedMiddleware, getUserById);

router.delete('/:id', protectedMiddleware, deleteUserById);

router.patch('/update', protectedMiddleware, updateUser);

router.get('/', protectedMiddleware, getAllUser)

export default router