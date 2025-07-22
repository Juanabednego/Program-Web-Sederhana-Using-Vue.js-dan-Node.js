<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Keranjang Belanja Anda</h1>

    <div v-if="cartStore.items.length === 0" class="text-center text-gray-500 text-lg">
      Keranjang Anda kosong. <router-link to="/" class="text-blue-500 hover:underline">Mulai belanja sekarang!</router-link>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-4 mb-6">
        <div v-for="item in cartStore.items" :key="item.product._id" class="flex items-center border rounded-lg p-4 shadow-sm">
          <img :src="item.product.image" :alt="item.product.name" class="w-24 h-24 object-cover rounded-md mr-4">
          <div class="flex-grow">
            <h2 class="text-xl font-semibold">{{ item.product.name }}</h2>
            <p class="text-gray-600">Rp {{ item.product.price.toLocaleString('id-ID') }} /meter</p>
            <p class="text-gray-500 text-sm">
              Diameter: {{ item.product.diameter }}, Panjang: {{ item.product.length }}, Material: {{ item.product.material }}
            </p>
          </div>
          <div class="flex items-center space-x-2 mr-4">
            <button
              @click="cartStore.updateCartItemQuantity(item.product._id, item.quantity - 1)"
              class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300"
            >
              -
            </button>
            <span class="font-bold text-lg">{{ item.quantity }}</span>
            <button
              @click="cartStore.updateCartItemQuantity(item.product._id, item.quantity + 1)"
              :disabled="item.quantity >= item.product.stock"
              class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300 disabled:opacity-50"
            >
              +
            </button>
          </div>
          <div class="text-lg font-bold min-w-[120px] text-right">
            Rp {{ (item.product.price * item.quantity).toLocaleString('id-ID') }}
          </div>
          <button
            @click="cartStore.removeFromCart(item.product._id)"
            class="ml-4 text-red-500 hover:text-red-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>
      </div>

      <div class="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold">Subtotal Barang:</h3>
        <span class="text-2xl font-bold">Rp {{ cartStore.cartSubtotal.toLocaleString('id-ID') }}</span>
      </div>

      <div class="flex justify-end mt-6 space-x-4">
        <router-link to="/" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg">
          Lanjutkan Belanja
        </router-link>
        <button
          @click="proceedToCheckout"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
        >
          Lanjutkan ke Pembayaran
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

const proceedToCheckout = () => {
  if (cartStore.items.length === 0) {
    alert('Keranjang Anda kosong. Tambahkan produk sebelum checkout!');
    return;
  }
  // Cek apakah ada item yang kuantitasnya 0 (karena tombol '-' bisa membuat 0)
  const invalidItems = cartStore.items.filter(item => item.quantity <= 0);
  if (invalidItems.length > 0) {
      alert('Beberapa item di keranjang memiliki kuantitas 0. Harap perbarui atau hapus.');
      return;
  }

  router.push({ name: 'checkout' });
};
</script>