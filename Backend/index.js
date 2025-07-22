import express from "express"
import dotenv from "dotenv"
dotenv.config();
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



const app = express()
const port = 9001


// Configuration
cloudinary.config({ 
      cloud_name: "de9cyaoqo", 
      api_key: 193388313656343, 
      api_secret: "qYF6EPlE381NVDneflc7AxHOtmk" // Click 'View API Keys' above to copy your API secret
});

//Middleware
app.use(helmet())
app.use(ExpressMongoSanitize())
app.use(express.json()) // agar request body bisa json
app.use(express.urlencoded({extended : true}))  // memasukkan inputan di urlencoded pada postman
app.use(cookieParser())
app.use(express.static('./public'))

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))



app.use('/api/v1/auth', authRouter)
app.use('/api/v1/lapangan', lapanganRouter)
app.use('/api/v1/pipa', pipaRouter)
app.use('/api/v1/orders', orderRouter); 

  



app.use(notFound)
app.use(errorHandler)



import mongoose from "mongoose";

// Gantilah dengan URI Atlas Anda
const uri ="mongodb+srv://benyaminsibarani2406:v8W62Q3ojhXQ8qJh@gorramos.nyb5u.mongodb.net/MyDatabase?retryWrites=true&w=majority&appName=GorRamos"


console.log("MongoDB URI:", uri);
async function connectToDatabase() {
  try {
    // Menghubungkan ke MongoDB Atlas menggunakan Mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas!");

    // Memastikan koneksi berhasil dengan melakukan ping
    const admin = mongoose.connection.db.admin();
    await admin.ping();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1);
  }
}

connectToDatabase(); 


app.listen(port, () => console.log(`Server up and run at ${port} port`))

