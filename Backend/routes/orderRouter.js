import express from 'express';
import upload from '../middleware/multerConfig.js';

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
  getTopSellingProducts,
  verifyOrderToken,
  uploadProofByToken,
} from '../controllers/orderController.js';

import {
  getFinancialReport,
  exportFinancialReportToExcel,
  exportFinancialReportToPdf,
} from '../controllers/financialReportController.js'; // Import dari file baru

import { protectedMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

router.get('/top-selling-products', protectedMiddleware, adminMiddleware, getTopSellingProducts);

router.get('/financial-report', protectedMiddleware, adminMiddleware, getFinancialReport);

router.get('/financial-report/excel', protectedMiddleware, adminMiddleware, exportFinancialReportToExcel);

router.get('/financial-report/pdf', protectedMiddleware, adminMiddleware, exportFinancialReportToPdf);

router.route('/')
  .post(protectedMiddleware, addOrderItems)
  .get(protectedMiddleware, adminMiddleware, getAllOrders); 
router.route('/myorders').get(protectedMiddleware, getMyOrders);

router.route('/:id')
  .get(protectedMiddleware, getOrderById);

router.route('/:id/status')
  .put(protectedMiddleware, adminMiddleware, updateOrderStatus); 

router.route('/:id/process')
  .put(protectedMiddleware, adminMiddleware, processingOrder); 

router.route('/:id/ship')
  .put(protectedMiddleware, adminMiddleware, shipOrder); 

router.route('/:id/complete')
  .put(protectedMiddleware, adminMiddleware, completeOrder); 

router.route('/:id/cancel')
  .put(protectedMiddleware, adminMiddleware, cancelOrder); 

router.route('/:id/pay')
  .put(protectedMiddleware, adminMiddleware, updateOrderToPaid);

router.route('/:id/deliver')
  .put(protectedMiddleware, adminMiddleware, updateOrderToDelivered); 

router.route('/:id/notes')
  .put(protectedMiddleware, adminMiddleware, addAdminNotes);

router.get('/:id/verify-token', verifyOrderToken);

router.post('/:id/upload-proof', upload.single('proofOfTransferImage'), uploadProofByToken);

router.route('/user/:userId').get(protectedMiddleware, getOrdersByUserId);

router.route('/:id/cancel-customer').put(protectedMiddleware, cancelOrderByCustomer);


export default router;
