import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  updateOrderToDelivered,
  getAllOrders,
  processingOrder,
  shipOrder,
  completeOrder,
  cancelOrder,
  updateOrderStatus,
  addAdminNotes,
  getOrdersByUserId,
  cancelOrderByCustomer,
} from '../controllers/orderController.js';
import { protectedMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
}); 
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, GIF) atau PDF yang diizinkan!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Create new order
router.route('/')
  .post(protectedMiddleware, upload.single('proofOfTransfer'), addOrderItems)
  .get(protectedMiddleware, adminMiddleware, getAllOrders); // Get all orders (Admin only)

// Get user's orders
router.route('/myorders').get(protectedMiddleware, getMyOrders);

// Order by ID routes
router.route('/:id')
  .get(protectedMiddleware, getOrderById);

// Order status management routes (Admin only)
router.route('/:id/status')
  .put(protectedMiddleware, adminMiddleware, updateOrderStatus); // Generic status update

router.route('/:id/process')
  .put(protectedMiddleware, adminMiddleware, processingOrder); // Set to Processing

router.route('/:id/ship')
  .put(protectedMiddleware, adminMiddleware, shipOrder); // Set to Shipped

router.route('/:id/complete')
  .put(protectedMiddleware, adminMiddleware, completeOrder); // Set to Completed

router.route('/:id/cancel')
  .put(protectedMiddleware, adminMiddleware, cancelOrder); // Cancel order

// Payment and delivery routes (Admin only)
router.route('/:id/pay')
  .put(protectedMiddleware, adminMiddleware, updateOrderToPaid); // Mark as paid

router.route('/:id/deliver')
  .put(protectedMiddleware, adminMiddleware, updateOrderToDelivered); // Mark as delivered

// Admin notes route
router.route('/:id/notes')
  .put(protectedMiddleware, adminMiddleware, addAdminNotes); // Add admin notes


// Get orders by user ID (using params)
router.route('/user/:userId').get(protectedMiddleware, getOrdersByUserId);

// Customer cancel order
router.route('/:id/cancel-customer').put(protectedMiddleware, cancelOrderByCustomer);

export default router;