import { defineStore } from 'pinia';
// import axios from 'axios'; // Tidak langsung digunakan di sini, tapi di view Checkout

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api/v1';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], 
  }),
  getters: {
    cartTotalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    cartSubtotal: (state) => state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0),
    // totalAmount: (state) => state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0) + state.shippingCost,
  },
  actions: {
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        this.items = JSON.parse(storedCart);
      }
    },
    saveCartToLocalStorage() {
      localStorage.setItem('cartItems', JSON.stringify(this.items));
    },

    addToCart(product, quantity = 1) {
      // Pastikan product memiliki _id dari MongoDB
      const existingItem = this.items.find(item => item.product._id === product._id);

      if (existingItem) {
        // Batasi kuantitas agar tidak melebihi stok
        if (existingItem.quantity + quantity > product.stock) {
          alert(`Stok ${product.name} hanya tersisa ${product.stock}.`);
          existingItem.quantity = product.stock; // Set ke stok maksimal
        } else {
          existingItem.quantity += quantity;
        }
      } else {
        // Cek jika kuantitas awal melebihi stok
        if (quantity > product.stock) {
            alert(`Stok ${product.name} hanya tersisa ${product.stock}. Tidak dapat menambahkan ${quantity} item.`);
            // Opsional: tambahkan sejumlah stok yang tersedia jika diinginkan
            this.items.push({ product, quantity: product.stock });
        } else {
            this.items.push({ product, quantity });
        }
      }
      this.saveCartToLocalStorage();
    },

    updateCartItemQuantity(productId, newQuantity) {
      const itemIndex = this.items.findIndex(item => item.product._id === productId);

      if (itemIndex > -1) {
        const item = this.items[itemIndex];
        // Pastikan tidak melebihi stok
        if (newQuantity > item.product.stock) {
            alert(`Stok ${item.product.name} hanya tersisa ${item.product.stock}.`);
            newQuantity = item.product.stock;
        }

        if (newQuantity > 0) {
          item.quantity = newQuantity;
        } else {
          // Hapus jika kuantitas 0 atau kurang
          this.items.splice(itemIndex, 1);
        }
        this.saveCartToLocalStorage();
      }
    },

    removeFromCart(productId) {
      this.items = this.items.filter(item => item.product._id !== productId);
      this.saveCartToLocalStorage();
    },

    clearCart() {
      this.items = [];
      this.saveCartToLocalStorage();
    },

  },
});