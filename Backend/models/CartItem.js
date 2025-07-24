
import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pipe',
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
 
}, {
  timestamps: true,
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;