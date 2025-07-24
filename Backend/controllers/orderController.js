// backend/controllers/orderController.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Pipe from '../models/pipaModel.js';
import CartItem from '../models/CartItem.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import crypto from 'crypto'; // Import crypto untuk generate token
import createTransporter from '../config/emailConfig.js'; // Import email transporter


// Fungsi Pembantu untuk Mengirim Email Invoice
const sendInvoiceEmail = async (order, user, proofUploadToken) => {
    const transporter = createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'; // Fallback URL
    const uploadLink = `${frontendUrl}/confirm-payment?orderId=${order._id}&token=${proofUploadToken}`;

    let orderItemsHtml = '';
    order.orderItems.forEach(item => {
        orderItemsHtml += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rp ${new Intl.NumberFormat('id-ID').format(item.price)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rp ${new Intl.NumberFormat('id-ID').format(item.quantity * item.price)}</td>
            </tr>
        `;
    });

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">Invoice Pesanan Anda</h2>
            </div>
            <div style="padding: 20px;">
                <p>Halo <strong>${user.nama || user.username}</strong>,</p>
                <p>Terima kasih atas pesanan Anda! Berikut adalah detail invoice pesanan Anda:</p>

                <p><strong>Nomor Pesanan:</strong> <span style="font-weight: bold; color: #0056b3;">#${order._id}</span></p>
                <p><strong>Tanggal Pesanan:</strong> ${order.createdAt.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <h3 style="color: #0056b3; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px;">Detail Produk:</h3>
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Produk</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Kuantitas</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Harga Satuan</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItemsHtml}
                    </tbody>
                </table>

                <h3 style="color: #0056b3; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px;">Ringkasan Pembayaran:</h3>
                <p style="margin: 5px 0;">Subtotal Barang: <span style="float: right;">Rp ${new Intl.NumberFormat('id-ID').format(order.itemsPrice)}</span></p>
                <p style="margin: 5px 0;">Pajak: <span style="float: right;">Rp ${new Intl.NumberFormat('id-ID').format(order.taxPrice)}</span></p>
                <p style="margin: 5px 0;">Biaya Pengiriman: <span style="float: right;">Rp ${new Intl.NumberFormat('id-ID').format(order.shippingPrice)}</span></p>
                <p style="font-size: 1.2em; font-weight: bold; color: #d9534f; margin: 15px 0;">Total yang Harus Dibayar: <span style="float: right;">Rp ${new Intl.NumberFormat('id-ID').format(order.totalPrice)}</span></p>
                <div style="clear: both;"></div>

                <h3 style="color: #0056b3; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px;">Informasi Pembayaran Transfer Bank:</h3>
                <p>Silakan lakukan transfer ke rekening berikut:</p>
                <p style="background-color: #f9f9f9; border: 1px solid #eee; padding: 10px; border-radius: 5px;">
                    <strong>Bank:</strong> BRI<br>
                    <strong>Nomor Rekening:</strong> 382901027786533<br>
                    <strong>Atas Nama:</strong> Juan A. Sihombing<br>
                    <strong>Jumlah:</strong> <span style="font-size: 1.1em; font-weight: bold; color: #d9534f;">Rp ${new Intl.NumberFormat('id-ID').format(order.totalPrice)}</span>
                </p>

                <p>Setelah transfer, mohon segera konfirmasi pembayaran dan unggah bukti transfer Anda melalui link di bawah ini:</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="${uploadLink}" style="display: inline-block; padding: 12px 25px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Konfirmasi & Unggah Bukti Transfer
                    </a>
                </p>
                <p style="font-size: 0.9em; color: #777; text-align: center; margin-top: 10px;">Link ini berlaku selama 1 jam. Jika sudah kedaluwarsa, silakan hubungi kami.</p>

                <p style="margin-top: 30px;">Jika Anda memiliki pertanyaan, jangan ragu untuk membalas email ini.</p>
                <p>Hormat kami,<br>Tim ${process.env.APP_NAME || 'Test Program'}</p>
            </div>
            <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 0.8em; color: #777; border-top: 1px solid #eee;">
                <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Test Program'}. Hak Cipta Dilindungi.</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"${process.env.APP_NAME || 'Test Program'}" <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: `Invoice Pesanan #${order._id} dari ${process.env.APP_NAME || 'Test Program'}`,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invoice email sent to ${user.email} for order ${order._id}`);
    } catch (error) {
        console.error(`Failed to send invoice email to ${user.email}:`, error);
        // Penting: Jangan throw error di sini, agar pembuatan order tetap sukses meskipun email gagal
    }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (hanya user terautentikasi)
const addOrderItems = asyncHandler(async (req, res, next) => {
  console.log('--- [addOrderItems] Request Received ---');
  console.log('Req Body:', req.body);
  console.log('User from Auth Middleware:', req.user ? req.user.nama : 'Not Authenticated');

  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated. Please log in.');
  }

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error('Tidak ada item dalam pesanan atau format orderItems tidak valid.');
  }
  if (!shippingAddress || typeof shippingAddress !== 'object' || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
    res.status(400);
    throw new Error('Alamat pengiriman tidak valid atau tidak lengkap.');
  }
  if (!paymentMethod) {
    res.status(400);
    throw new Error('Metode pembayaran diperlukan.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  console.log('Transaction session started.');

  let createdOrder;

  try {
    const updatedOrderItems = [];
    for (const item of orderItems) {
      const pipeDoc = await Pipe.findById(item.product).session(session);
      if (!pipeDoc) {
        throw new Error(`Produk pipa dengan ID ${item.product} tidak ditemukan.`);
      }
      if (pipeDoc.stock < item.quantity) {
        throw new Error(`Stok untuk produk "${pipeDoc.pipeName}" tidak mencukupi. Tersedia: ${pipeDoc.stock}, diminta: ${item.quantity}`);
      }
      pipeDoc.stock -= item.quantity;
      await pipeDoc.save({ session });

      updatedOrderItems.push({
        product: pipeDoc._id,
        name: pipeDoc.pipeName,
        quantity: item.quantity,
        price: pipeDoc.pricePerMeter,
        image: pipeDoc.imageUrl,
      });
    }
    console.log('All product stocks verified and updated in session.');

    const proofUploadToken = paymentMethod === 'Transfer Bank' ? crypto.randomBytes(32).toString('hex') : undefined;
    const proofUploadTokenExpires = paymentMethod === 'Transfer Bank' ? new Date(Date.now() + 60 * 60 * 1000) : undefined;

    console.log('Creating new Order object...');
    const order = new Order({
      user: req.user._id,
      orderItems: updatedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      proofOfTransferImage: undefined,
      orderStatus: paymentMethod === 'Transfer Bank' ? 'Pending Payment' : 'Processing',
      proofUploadToken: proofUploadToken,
      proofUploadTokenExpires: proofUploadTokenExpires,
    });

    createdOrder = await order.save({ session });
    console.log('Order saved in session. Order ID:', createdOrder._id);

    await CartItem.deleteMany({ user: req.user._id }).session(session);
    console.log('User cart cleared in session.');

    await session.commitTransaction();
    console.log('Transaction committed successfully.');

    const user = await User.findById(req.user._id);

    if (user && paymentMethod === 'Transfer Bank' && proofUploadToken) {
        await sendInvoiceEmail(createdOrder, user, proofUploadToken);
    } else if (!user) {
        console.error('User not found after order creation, cannot send invoice email.');
    } else if (paymentMethod !== 'Transfer Bank') {
        console.log('Skipping invoice email. Payment method is not Transfer Bank.');
    }

    res.status(201).json(createdOrder);

  } catch (error) {
    await session.abortTransaction();
    console.error('--- [addOrderItems] ERROR: Transaction aborted ---');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    res.status(400);
    next(error);
  } finally {
    session.endSession();
    console.log('Transaction session ended.');
    console.log('--- [addOrderItems] Request Finished ---');
  }
});


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'nama email')
    .populate('orderItems.product', 'pipeName imageUrl');

  if (order) {
    if (!order.user || (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      res.status(403);
      throw new Error('Tidak memiliki izin untuk melihat pesanan ini');
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Pesanan tidak ditemukan');
  }
});


// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'pipeName imageUrl');
  res.json(orders);
});


// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'id nama email')
        .sort({ createdAt: -1 });
    res.json(orders);
});


const processingOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (order) {
    order.orderStatus = 'Processing';
    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order status updated to Processing',
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status to Shipped
// @route   PUT /api/v1/orders/:id/ship
// @access  Private/Admin
const shipOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (order) {
    order.orderStatus = 'Shipped';
    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order status updated to Shipped',
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status to Completed
// @route   PUT /api/v1/orders/:id/complete
// @access  Private/Admin
const completeOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (order) {
    order.orderStatus = 'Completed';
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order status updated to Completed',
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private/Admin
const cancelOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (order) {
    if (order.orderStatus === 'Completed') {
      res.status(400);
      throw new Error('Cannot cancel a completed order');
    }

    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    res.status(200).json({
      message: 'Order has been cancelled',
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status (Generic)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { orderStatus } = req.body;

  const validStatuses = ['Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Completed'];
  if (!validStatuses.includes(orderStatus)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(orderId);

  if (order) {
    order.orderStatus = orderStatus;

    if(orderStatus == 'Completed'){
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      message: `Order status updated to ${orderStatus}`,
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();

    if (order.orderStatus === 'Pending Payment') {
      order.orderStatus = 'Processing';
    }

    const updatedOrder = await order.save();

    res.json({
      message: 'Order marked as paid',
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});


// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    order.orderStatus = 'Completed';

    const updatedOrder = await order.save();

    res.json({
      message: 'Order marked as delivered',
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Add admin notes to order
// @route   PUT /api/v1/orders/:id/notes
// @access  Private/Admin
const addAdminNotes = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.adminNotes = notes;
    const updatedOrder = await order.save();

    res.json({
      message: 'Admin notes added successfully',
      order: updatedOrder,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get orders by user ID (using params)
// @route   GET /api/v1/orders/user/:userId
// @access  Private
const getOrdersByUserId = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;

    console.log(`[getOrdersByUserId] Fetching orders for user ID: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      throw new Error('User ID tidak valid');
    }

    const orders = await Order.find({ user: userId })
      .populate('user', 'nama email')
      .populate({
        path: 'orderItems.product',
        select: 'pipeName pricePerMeter image description'
      })
      .sort({ createdAt: -1 });

    console.log(`[getOrdersByUserId] Found ${orders.length} orders for user ${userId}`);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('[getOrdersByUserId] Error:', error);
    res.status(500);
    throw new Error(error.message || 'Gagal mengambil data pesanan');
  }
});

// @desc    Cancel order by customer
// @route   PUT /api/v1/orders/:id/cancel-customer
// @access  Private (Customer only can cancel their own order)
const cancelOrderByCustomer = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id;

    console.log(`[cancelOrderByCustomer] User ${userId} attempting to cancel order ${orderId}`);

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error('Pesanan tidak ditemukan');
    }

    if (order.user.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('Anda tidak memiliki izin untuk membatalkan pesanan ini');
    }

    const cancelableStatuses = ['Pending Payment', 'Processing'];
    if (!cancelableStatuses.includes(order.orderStatus)) {
      res.status(400);
      throw new Error(`Pesanan dengan status "${order.orderStatus}" tidak dapat dibatalkan`);
    }
    order.orderStatus = 'Cancelled';
    const updatedOrder = await order.save();

    console.log(`[cancelOrderByCustomer] Order ${orderId} successfully cancelled by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Pesanan berhasil dibatalkan',
      data: updatedOrder
    });

  } catch (error) {
    console.error('[cancelOrderByCustomer] Error:', error);
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw new Error(error.message || 'Gagal membatalkan pesanan');
  }
});

// @desc    Get top selling products
// @route   GET /api/orders/top-selling-products
// @access  Private/Admin
const getTopSellingProducts = asyncHandler(async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $match: {
          $or: [
            { orderStatus: 'Completed' },
            { orderStatus: 'Delivered' }
          ]
        }
      },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalQuantitySold: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 7 },
    ]);

    if (topProducts.length === 0) {
      return res.status(200).json([]);
    }

    res.json(topProducts);
  } catch (error) {
    console.error('ERROR: Gagal mengambil data produk terlaris:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Gagal mengambil data produk terlaris', error: error.message });
  }
});

// --- FUNGSI BARU UNTUK EMAIL INVOICE DAN UPLOAD BUKTI TRANSFER ---

// @desc    Verify order token and get order details (for public payment confirmation link)
// @route   GET /api/orders/:id/verify-token?token=<token>
// @access  Public (without JWT but with unique token)
const verifyOrderToken = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { token } = req.query;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400);
    throw new Error('ID Pesanan tidak valid.');
  }

  const order = await Order.findById(orderId).select('+proofUploadToken +proofUploadTokenExpires').populate('user', 'nama email');

  if (!order) {
    if (order && order.proofUploadTokenExpires && new Date() > order.proofUploadTokenExpires) {
        res.status(401);
        throw new Error('Token sudah kedaluwarsa.');
    }
    res.status(404);
    throw new Error('Pesanan tidak ditemukan.');
  }

  if (order.proofUploadToken !== token || new Date() > order.proofUploadTokenExpires) {
    res.status(401);
    throw new Error('Token tidak valid atau sudah kedaluwarsa.');
  }

  res.json({
    _id: order._id,
    orderItems: order.orderItems,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    itemsPrice: order.itemsPrice,
    taxPrice: order.taxPrice,
    shippingPrice: order.shippingPrice,
    totalPrice: order.totalPrice,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
    user: {
        nama: order.user.nama,
        email: order.user.email
    },
    proofOfTransferImage: order.proofOfTransferImage
  });
});

// @desc    Upload proof of transfer for an order using a unique token
// @route   PUT /api/orders/:id/upload-proof
// @access  Public (via unique token)
const uploadProofByToken = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { token } = req.body;
  const proofOfTransferFile = req.file;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400);
    throw new Error('ID Pesanan tidak valid.');
  }

  if (!proofOfTransferFile) {
    res.status(400);
    throw new Error('Bukti transfer diperlukan.');
  }

  const order = await Order.findById(orderId).select('+proofUploadToken +proofUploadTokenExpires');

  if (!order) {
    if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
        fs.unlinkSync(proofOfTransferFile.path);
    }
    res.status(404);
    throw new Error('Pesanan tidak ditemukan.');
  }

  if (order.proofUploadToken !== token || new Date() > order.proofUploadTokenExpires) {
    if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
        fs.unlinkSync(proofOfTransferFile.path);
    }
    res.status(401);
    throw new Error('Token tidak valid atau sudah kedaluwarsa.');
  }

  if (!['Pending Payment'].includes(order.orderStatus)) {
    if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
        fs.unlinkSync(proofOfTransferFile.path);
    }
    res.status(400);
    throw new Error(`Pesanan dengan status "${order.orderStatus}" tidak dapat lagi diunggah bukti transfer.`);
  }

  let proofOfTransferImageUrl = null;
  try {
    const result = await cloudinary.uploader.upload(proofOfTransferFile.path, {
      folder: 'proof_of_transfers',
      resource_type: 'image',
    });
    proofOfTransferImageUrl = result.secure_url;
  } catch (uploadError) {
    console.error('ERROR: Cloudinary upload failed in uploadProofByToken:', uploadError);
    res.status(500);
    throw new Error(`Gagal mengunggah bukti transfer: ${uploadError.message}`);
  } finally {
    if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
        fs.unlinkSync(proofOfTransferFile.path);
    }
  }

  order.proofOfTransferImage = proofOfTransferImageUrl;
  order.orderStatus = 'Processing';
  order.proofUploadToken = undefined;
  order.proofUploadTokenExpires = undefined;

  const updatedOrder = await order.save();

  res.json({
    message: 'Bukti transfer berhasil diunggah. Pesanan Anda kini sedang diproses.',
    order: updatedOrder,
  });
});
// --- AKHIR FUNGSI BARU ---

// Export semua fungsi di sini
export {
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
};
