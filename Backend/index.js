import express from "express"
import dotenv from "dotenv"
dotenv.config(); // Pastikan dotenv dimuat di awal

// Router
import authRouter from './routes/authRouter.js'
import lapanganRouter from './routes/lapanganRouter.js'
import pipaRouter from './routes/pipaRouter.js'
import orderRouter from './routes/orderRouter.js'

import cors from 'cors'

import { notFound, errorHandler } from "./middleware/errorMiddleware.js"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import ExpressMongoSanitize from "express-mongo-sanitize"
import { v2 as cloudinary } from 'cloudinary';

import mongoose from "mongoose"; // Pindahkan impor mongoose ke atas

const app = express()
const port = process.env.PORT || 9001 // Gunakan port dari .env atau default 9001


// Configuration
cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // <-- Gunakan variabel env
      api_key: process.env.CLOUDINARY_API_KEY,       // <-- Gunakan variabel env
      api_secret: process.env.CLOUDINARY_API_SECRET  // <-- Gunakan variabel env
});

//Middleware
app.use(helmet())
app.use(ExpressMongoSanitize())
app.use(express.json()) // agar request body bisa json
app.use(express.urlencoded({extended : true})) 
app.use(cookieParser())
app.use(express.static('./public'))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9000',
  credentials: true
}))

// Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/lapangan', lapanganRouter)
app.use('/api/v1/pipa', pipaRouter)
app.use('/api/v1/orders', orderRouter);

// Error handling middleware
app.use(notFound)
app.use(errorHandler)


// Gantilah dengan URI Atlas Anda
const uri = process.env.DATABASE || "mongodb+srv://benyaminsibarani2406:v8W62Q3ojhXQ8qJh@gorramos.nyb5u.mongodb.net/MyDatabase?retryWrites=true&w=majority&appName=GorRamos" // <-- Menggunakan variabel env DATABASE

console.log("MongoDB URI:", uri);
async function connectToDatabase() {
  try {
    // Menghubungkan ke MongoDB Atlas menggunakan Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas!");

    // Memulai server setelah koneksi database berhasil
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1); // Keluar dari proses jika koneksi gagal
  }
}

connectToDatabase();
