import mongoose from 'mongoose';
import validator from "validator";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "username harus diisi"],
        unique: [true, 'Username sudah digunakan']
    },
    password: {
        type: String,
        required: [true, "Password harus diisi"],
        minLength: [6, "Password minimal 6 karakter"],
    },
    email: {
        type: String,
        required: [true, "Email harus diisi"],
        unique: [true, "Email sudah pernah didaftarkan"],
        validate: {
            validator: validator.isEmail,
            message: "Inputan harus berformat Email. Ex : abc@gmail.com"
        }
    },
    nama: {
        type: String,
        required: [true, "Nama harus diisi"],
        unique: [true, 'Username sudah digunakan']
    },
    role : {
        type : String,
        enum : ['admin', 'customer'],
        default : 'customer',
        required : [true, "Role harus diisi"]
    }
});


const User = mongoose.model("User", userSchema);

export default User;
