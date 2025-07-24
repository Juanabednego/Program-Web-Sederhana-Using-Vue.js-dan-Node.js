// backend/models/Order.js
import { AggregationCursor } from 'mongodb'; // Ini mungkin tidak perlu jika tidak digunakan langsung
import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pipe', // Mengacu ke model Pipe Anda
  },
  name: { type: String, required: true }, // Biasanya pipeName dari pipa
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // Ini akan diambil dari pricePerMeter * quantity di controller
  image: { type: String, required: false },
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Mengacu ke model User Anda (konsisten)
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      required: true,
      default: 'Pending Payment',
      enum: ['Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Completed'],
    },
    proofOfTransferImage: {
      type: String,
      required: false, // <-- PERUBAHAN: Tidak lagi required saat order dibuat
    },
    // --- START NEW FIELDS FOR EMAIL INVOICE ---
    proofUploadToken: { // Token unik untuk link konfirmasi pembayaran
      type: String,
      unique: true, // Pastikan token unik
      sparse: true, // Memungkinkan nilai null/undefined untuk dokumen yang tidak memiliki token
      select: false, // Tidak akan disertakan dalam query default, harus dipilih secara eksplisit
    },
    proofUploadTokenExpires: { // Waktu kedaluwarsa token
      type: Date,
      select: false, // Tidak akan disertakan dalam query default, harus dipilih secara eksplisit
    },
    // --- END NEW FIELDS FOR EMAIL INVOICE ---
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;