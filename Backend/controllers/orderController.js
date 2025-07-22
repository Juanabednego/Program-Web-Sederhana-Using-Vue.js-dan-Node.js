import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Pipe from '../models/pipaModel.js'; 
import CartItem from '../models/CartItem.js';
import User from '../models/userModel.js'; 
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (hanya user terautentikasi)
export const addOrderItems = asyncHandler(async (req, res) => {
  console.log('--- addOrderItems: Request Received ---');
  console.log('Req Body (Raw):', req.body);
  console.log('Req File (from Multer):', req.file);
  console.log('User from Auth Middleware (req.user):', req.user ? req.user.nama : 'Not Available (User not authenticated)');

  const {
    orderItems: orderItemsString,
    shippingAddress: shippingAddressString,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  let orderItems;
  let shippingAddress;

  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('User not authenticated. Please log in.');
  }

  try {
    orderItems = JSON.parse(orderItemsString);
    shippingAddress = JSON.parse(shippingAddressString);
    console.log('Parsed orderItems:', orderItems);
    console.log('Parsed shippingAddress:', shippingAddress);
  } catch (parseError) {
    console.error('ERROR: Parsing orderItems/shippingAddress failed:', parseError);
    res.status(400);
    throw new Error('Data pesanan atau alamat pengiriman tidak valid (format JSON salah).');
  }

  const proofOfTransferFile = req.file;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('Tidak ada item dalam pesanan');
  }

  if (paymentMethod === 'Transfer Bank' && !proofOfTransferFile) {
    res.status(400);
    throw new Error('Bukti transfer diperlukan untuk metode pembayaran Transfer Bank.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  console.log('Transaction session started.');

  let proofOfTransferImageUrl = null;

  try {
    const updatedOrderItems = [];
    for (const item of orderItems) {
      console.log(`Checking stock for product ID: ${item.product} (Requested Quantity: ${item.quantity})`);
      const pipeDoc = await Pipe.findById(item.product).session(session); // Menggunakan model Pipe dari pipaModel.js
      if (!pipeDoc) {
        throw new Error(`Produk pipa dengan ID ${item.product} tidak ditemukan.`);
      }

      if (pipeDoc.stock < item.quantity) {
        throw new Error(`Stok untuk produk "${pipeDoc.pipeName}" tidak mencukupi. Tersedia: ${pipeDoc.stock}, diminta: ${item.quantity}`);
      }

      console.log(`Before stock update for ${pipeDoc.pipeName}: ${pipeDoc.stock}`);
      pipeDoc.stock -= item.quantity;
      await pipeDoc.save({ session });
      console.log(`After stock update for ${pipeDoc.pipeName}: ${pipeDoc.stock}`);

      updatedOrderItems.push({
        product: pipeDoc._id,
        name: pipeDoc.pipeName,
        quantity: item.quantity,
        price: pipeDoc.pricePerMeter, 
        image: pipeDoc.imageUrl,
      });
    }
    console.log('All product stocks verified and updated in session.');

    if (proofOfTransferFile) {
      console.log('Attempting to upload proof of transfer to Cloudinary...');
      try {
        const result = await cloudinary.uploader.upload(proofOfTransferFile.path, {
          folder: 'proof_of_transfers',
          resource_type: 'image',
        }); 
        proofOfTransferImageUrl = result.secure_url;
        console.log('Cloudinary upload successful. URL:', proofOfTransferImageUrl);
      } catch (uploadError) {
        console.error('ERROR: Cloudinary upload failed:', uploadError);
        if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
            fs.unlink(proofOfTransferFile.path, (err) => {
                if (err) console.error('Error deleting local file after failed Cloudinary upload:', err);
            });
        }
        throw new Error(`mengunggah bukti transfer: ${uploadError.message}`);
      } finally {
        if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
            fs.unlink(proofOfTransferFile.path, (err) => {
                if (err) console.error('Error deleting local file after successful Cloudinary upload:', err);
                else console.log('Local proof of transfer file deleted.');
            });
        }
      }
    }

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
      proofOfTransferImage: proofOfTransferImageUrl,
      orderStatus: 'Pending Payment',
    });

    const createdOrder = await order.save({ session });
    console.log('Order saved in session. Order ID:', createdOrder._id);

    console.log('Attempting to clear user cart from database...');
    await CartItem.deleteMany({ user: req.user._id }).session(session);
    console.log('User cart cleared in session.');

    await session.commitTransaction();
    console.log('Transaction committed successfully. All changes saved to DB.');

    res.status(201).json(createdOrder);

  } catch (error) {
    await session.abortTransaction();
    console.error('--- ERROR: Transaction aborted due to ---');
    console.error('Error Message:', error.message);
    console.error('Full Error Object:', error);

    if (proofOfTransferFile && fs.existsSync(proofOfTransferFile.path)) {
        fs.unlink(proofOfTransferFile.path, (err) => {
            if (err) console.error('Error deleting local file during transaction abort:', err);
        });
    }

    res.status(400);
    throw new Error(error.message || 'Gagal membuat pesanan: Terjadi kesalahan yang tidak terduga.');
  } finally {
    session.endSession();
    console.log('Transaction session ended.');
    console.log('--- addOrderItems: Request Finished ---');
  }
});


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'nama email') // ***PENTING: Mengacu properti 'username' di userModel.js***
    .populate('orderItems.product', 'pipeName imageUrl'); // Mengacu properti 'pipeName' di pipaModel.js

  if (order) {
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Tidak diotorisasi: Anda tidak memiliki akses ke pesanan ini');
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
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'pipeName imageUrl'); // Mengacu properti 'pipeName' di pipaModel.js
  res.json(orders);
});

// @desc    Update order to delivered (Admin Only)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
// export const updateOrderToDelivered = asyncHandler(async (req, res) => {
//     const order = await Order.findById(req.params.id);

//     if (order) {
//         order.isDelivered = true;
//         order.deliveredAt = Date.now();
//         order.orderStatus = 'Delivered';
//         const updatedOrder = await order.save();
//         res.json(updatedOrder);
//     } else {
//         res.status(404);
//         throw new Error('Order not found');
//     }
// });
 

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'id nama email') // ***PENTING: Mengacu properti 'nama' di userModel.js***
        .sort({ createdAt: -1 });
    res.json(orders);
});


export const processingOrder = asyncHandler(async (req, res) => {
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
export const shipOrder = asyncHandler(async (req, res) => {
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
export const completeOrder = asyncHandler(async (req, res) => {
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
export const cancelOrder = asyncHandler(async (req, res) => {
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
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const { orderStatus } = req.body;

  // Validate status
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
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    
    // Auto update status to Processing if still Pending Payment
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
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true; 
    order.deliveredAt = Date.now();
    
    // Auto update status to Completed
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
export const addAdminNotes = asyncHandler(async (req, res) => {
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
export const getOrdersByUserId = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId; // Dari URL params

    console.log(`[getOrdersByUserId] Fetching orders for user ID: ${userId}`);

    // Validasi ObjectId
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
      .sort({ createdAt: -1 }); // Urutkan dari yang terbaru

    console.log(`[getOrdersByUserId] Found ${orders.length} orders for user ${userId}`);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('[getOrdersByUserId] Error:', error);
    res.status(500);
    throw new Error('Gagal mengambil data pesanan');
  }
});

// @desc    Cancel order by customer
// @route   PUT /api/v1/orders/:id/cancel-customer
// @access  Private (Customer only can cancel their own order)
export const cancelOrderByCustomer = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id; // Dari middleware authentication

    console.log(`[cancelOrderByCustomer] User ${userId} attempting to cancel order ${orderId}`);

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error('Pesanan tidak ditemukan');
    }

    // Pastikan order milik user yang sedang login
    if (order.user.toString() !== userId.toString()) {
      res.status(403);
      throw new Error('Anda tidak memiliki izin untuk membatalkan pesanan ini');
    }

    // Cek apakah order masih bisa dibatalkan
    const cancelableStatuses = ['Pending Payment', 'Processing'];
    if (!cancelableStatuses.includes(order.orderStatus)) {
      res.status(400);
      throw new Error(`Pesanan dengan status "${order.orderStatus}" tidak dapat dibatalkan`);
    }
    // Update status order
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