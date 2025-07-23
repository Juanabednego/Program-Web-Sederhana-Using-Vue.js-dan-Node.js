import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// --- IMPORT MODEL ORDER DI SINI ---
import Order from '../models/Order.js'; // PASTIKAN PATH KE MODEL ORDER.JS ANDA BENAR

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
import { protectedMiddleware, adminMiddleware } from '../middleware/authMiddleware.js'; // Pastikan ini benar

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


// --- NEW ROUTE: GET TOP SELLING PRODUCTS ---
// @desc    Get top selling products
// @route   GET /api/orders/top-selling-products
// @access  Private/Admin
router.get('/top-selling-products', protectedMiddleware, adminMiddleware, async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      // Tahap 1: Unwind orderItems - Memisahkan setiap item dalam array orderItems menjadi dokumen terpisah
      { $unwind: '$orderItems' },

      // Tahap 2: Filter berdasarkan status pesanan yang telah selesai
      // Hanya menghitung produk dari pesanan yang sudah 'Delivered' atau 'Completed'
      {
        $match: {
          orderStatus: { $in: ['Delivered', 'Completed'] }
          // Anda juga bisa menambahkan filter tanggal di sini, contoh:
          // createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } // Data 1 tahun terakhir
        }
      },

      // Tahap 3: Group berdasarkan nama produk dan hitung total kuantitas/pendapatan
      {
        $group: {
          _id: '$orderItems.name', // Kelompokkan berdasarkan nama produk dari orderItems
          totalQuantitySold: { $sum: '$orderItems.quantity' }, // Menghitung total kuantitas terjual
          totalRevenue: { $sum: { $multiply: ['$orderItems.quantity', '$orderItems.price'] } } // Menghitung total pendapatan
        }
      },

      // Tahap 4: Urutkan hasil dari yang terlaris (berdasarkan kuantitas)
      { $sort: { totalQuantitySold: -1 } }, // Urutkan dari terbesar ke terkecil

      // Tahap 5: Batasi jumlah hasil (misalnya 7 produk teratas)
      { $limit: 7 }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error(`Error fetching top selling products: ${error.message}`);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});
// --- END NEW ROUTE ---


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