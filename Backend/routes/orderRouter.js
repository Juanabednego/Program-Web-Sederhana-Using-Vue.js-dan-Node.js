// backend/routes/orderRouter.js
import express from 'express';
// Hapus semua import multer, path, fileURLToPath, fs dari sini karena sudah ada di multerConfig.js
// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// --- IMPORT MULTER CONFIG DARI FILE TERPISAH ---
import upload from '../middleware/multerConfig.js'; // PASTIKAN PATH INI BENAR!

// --- IMPORT MODEL ORDER DI SINI (Jika diperlukan di router, tapi umumnya tidak) ---
// import Order from '../models/Order.js'; // Umumnya model tidak diimpor langsung di router, tapi di controller

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
  getTopSellingProducts, // Pastikan ini diimpor jika digunakan
  // --- IMPORT FUNGSI BARU UNTUK EMAIL INVOICE DAN UPLOAD BUKTI TRANSFER ---
  verifyOrderToken,
  uploadProofByToken,
} from '../controllers/orderController.js';
import { protectedMiddleware, adminMiddleware } from '../middleware/authMiddleware.js'; // Pastikan ini benar

// Hapus seluruh bagian ini karena sudah ditangani di multerConfig.js:
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadsDir = path.join(__dirname, '../public/uploads');
// if (!fs.existsSync(uploadsDir)) { /* ... */ }
// const storage = multer.diskStorage({ /* ... */ });
// const fileFilter = (req, file, cb) => { /* ... */ };
// const upload = multer({ /* ... */ });


// --- NEW ROUTE: GET TOP SELLING PRODUCTS ---
// @desc    Get top selling products
// @route   GET /api/orders/top-selling-products
// @access  Private/Admin
router.get('/top-selling-products', protectedMiddleware, adminMiddleware, getTopSellingProducts); // Menggunakan fungsi dari controller


// Create new order
// PENTING: Hapus `upload.single('proofOfTransfer')` dari sini.
// Endpoint `addOrderItems` tidak lagi menerima file upload.
// Upload bukti transfer akan ditangani oleh rute `/api/orders/:id/upload-proof`
router.route('/')
  .post(protectedMiddleware, addOrderItems) // <-- PERUBAHAN UTAMA DI SINI (multer dihapus)
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
  .put(protectedMiddleware, adminMiddleware, addAdminNotes);


// --- RUTE BARU UNTUK EMAIL INVOICE DAN KONFIRMASI PEMBAYARAN ---
// @desc    Verify order token and get order details (for public payment confirmation link)
// @route   GET /api/orders/:id/verify-token?token=<token>
// @access  Public (without JWT but with unique token)
router.get('/:id/verify-token', verifyOrderToken);

// @desc    Upload proof of transfer for an order using a unique token
// @route   PUT /api/orders/:id/upload-proof
// @access  Public (via unique token)
// Gunakan middleware `upload.single('proofOfTransferImage')` di sini
// sesuai dengan nama field yang diharapkan di `uploadProofByToken`
router.put('/:id/upload-proof', upload.single('proofOfTransferImage'), uploadProofByToken);
// --- AKHIR RUTE BARU ---


// Get orders by user ID (using params)
router.route('/user/:userId').get(protectedMiddleware, getOrdersByUserId);

// Customer cancel order
router.route('/:id/cancel-customer').put(protectedMiddleware, cancelOrderByCustomer);

export default router;
