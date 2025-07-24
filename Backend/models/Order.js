import { AggregationCursor } from 'mongodb'; 
import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pipe',
  },
  name: { type: String, required: true }, 
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, 
  image: { type: String, required: false },
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', 
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
      required: false, 
    },
    proofUploadToken: { 
      type: String,
      unique: true, 
      sparse: true, 
      select: false, 
    },
    proofUploadTokenExpires: { 
      type: Date,
      select: false, 
    },
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