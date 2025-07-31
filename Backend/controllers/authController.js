import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import asyncHandler from "../middleware/asyncHandler.js";

const signToken = id => {
    return jwt.sign({ id }, "secret-jwt-saya", {
        expiresIn: '500d',
    });
};

const createSendResToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const isDev = false;

    const cookieOption = {
        expire: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: isDev
    };

    res.cookie('jwt', token, cookieOption);

    user.password = undefined;

    res.status(statusCode).json({
        data: user,
        role : user.role,
        jwt: token,
        user_id : user._id
    });
};

// --- Register User ---
export const registerUser = asyncHandler(async (req, res) => {
    const { username, password, email, nama } = req.body;
    if (!username || !password || !email || !nama) {
        res.status(400);
        throw new Error('username, password, email, dan nama tidak boleh kosong');
    }

    // Tentukan role: admin jika user pertama
    const isAdmin = (await User.countDocuments()) === 0;
    const role = isAdmin ? "admin" : "customer";

    const createUser = await User.create({ username, password, email, nama, role });
    createSendResToken(createUser, 201, res);
});

// --- Login User (tanpa bcrypt) ---
export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error('username atau password tidak boleh kosong');
    }

    const userData = await User.findOne({ username });

    if (userData && userData.password === password) {
        createSendResToken(userData, 200, res);
    } else {
        res.status(400);
        throw new Error('username atau password salah');
    }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    
    if (user) {
        res.status(200).json({
            user: user.toObject()  
        })
    } else {
        res.status(404)
        throw new Error('User not found :(')
    }
})

export const logoutUser = async(req, res) => {
    res.cookie('jwt', "", {
        httpOnly : true,
        expires : new Date(Date.now())
    })

    res.status(200).json({
        message : "Logout berhasil"
    })
}


export const updateUser = asyncHandler(async (req, res) => {
    const { username, email, nama, password, user_id } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
        res.status(404);
        throw new Error("User tidak ditemukan");
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (nama) user.nama = nama;
    if (password) user.password = password;

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).json({
        message: "Data user berhasil diupdate",
        data: updatedUser
    });
});


export const getAllUser = asyncHandler(async (req, res) => {
    const users = await User.find(); 

    res.status(200).json({
        message: "Berhasil mengambil semua data user (termasuk password)",
        total: users.length,
        data: users
    });
});

export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id); 

    if (!user) {
        res.status(404);
        throw new Error("User tidak ditemukan");
    }
    res.status(200).json({
        message: "Berhasil mengambil data user",
        data: user
    });
});

export const deleteUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        res.status(404);
        throw new Error("User tidak ditemukan");
    }

    await user.deleteOne();

    res.status(200).json({
        message: "User berhasil dihapus",
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            nama: user.nama,
            password: user.password,
            __v: user.__v
        }
    });
});
