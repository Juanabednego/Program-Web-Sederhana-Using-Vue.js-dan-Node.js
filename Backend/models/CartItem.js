
import mongoose from 'mongoose';

const cartItemSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  product: { // Mengacu pada Pipe/Product ID
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Pipe', // Atau 'Product' jika nama modelnya itu
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