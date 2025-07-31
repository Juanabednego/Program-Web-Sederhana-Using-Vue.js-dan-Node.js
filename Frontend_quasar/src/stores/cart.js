import { defineStore } from 'pinia';
import { useQuasar } from 'quasar'; 

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  getters: {
    cartTotalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    cartSubtotal: (state) => state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0),
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
      const $q = useQuasar(); // Inisialisasi Quasar instance di dalam action

      const existingItem = this.items.find(item => item.product._id === product._id);

      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
          existingItem.quantity = product.stock; // Set ke stok maksimal
          $q.notify({
            type: 'warning',
            message: `Stok ${product.name} hanya tersisa ${product.stock}. Kuantitas disesuaikan.`,
            position: 'top',
            timeout: 2500
          });
        } else {
          existingItem.quantity += quantity;
        }
      } else {
        if (quantity > product.stock) {
          $q.notify({
            type: 'warning',
            message: `Stok ${product.name} hanya tersisa ${product.stock}. Tidak dapat menambahkan ${quantity} item.`,
            position: 'top',
            timeout: 3000
          });
          this.items.push({ product, quantity: product.stock });
        } else {
          this.items.push({ product, quantity });
        }
      }
      this.saveCartToLocalStorage();
    },

    updateCartItemQuantity(productId, newQuantity) {
      const $q = useQuasar(); 

      const itemIndex = this.items.findIndex(item => item.product._id === productId);

      if (itemIndex > -1) {
        const item = this.items[itemIndex];
        if (newQuantity > item.product.stock) {
          newQuantity = item.product.stock;
          $q.notify({
            type: 'warning',
            message: `Stok ${item.product.name} hanya tersisa ${item.product.stock}. Kuantitas disesuaikan.`,
            position: 'top',
            timeout: 2500
          });
        }

        if (newQuantity > 0) {
          item.quantity = newQuantity;
        } else {
          this.items.splice(itemIndex, 1);
          $q.notify({
            type: 'info',
            message: `"${item.product.name}" dihapus dari keranjang.`,
            position: 'top',
            timeout: 1500
          });
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
