import express from "express"
import { protectedMiddleware, adminMiddleware } from "../middleware/authMiddleware.js"
// import { CreateProduct, updateProduct, deleteProduct, AllProduct, fileUpload, detailProduct } from "../controllers/ProductController.js"
import { upload } from "../utils/uploadFileHandler.js"
import { AllLapangan, CreateLapangan, detailLapangan, fileUpload, updateLapangan } from "../controllers/LapanganController.js"

const router = express.Router()

router.post('/', protectedMiddleware, adminMiddleware, CreateLapangan)


// router.get('/', protectedMiddleware, AllLapangan)
router.get('/', AllLapangan)



router.get('/:id', protectedMiddleware, detailLapangan)

router.put('/:id', protectedMiddleware, adminMiddleware, updateLapangan)    

router.post('/file-upload', upload.single('image'), fileUpload)

export default router

