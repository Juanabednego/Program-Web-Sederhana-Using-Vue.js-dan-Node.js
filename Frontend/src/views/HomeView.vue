<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Produk Kami</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="product in products" :key="product._id" class="border rounded-lg shadow-md p-4">
        <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover rounded-md mb-4">
        <h2 class="text-xl font-semibold mb-2">{{ product.name }}</h2>
        <p class="text-gray-600">Diameter: {{ product.diameter }}</p>
        <p class="text-gray-600">Panjang: {{ product.length }}</p>
        <p class="text-gray-600">Kelas: {{ product.clazz }}</p>
        <p class="text-gray-600">Material: {{ product.material }}</p>
        <p class="text-gray-600">Warna: {{ product.color }}</p>
        <p class="text-gray-600">Stok: {{ product.stock }}</p>
        <p class="text-gray-800 font-bold text-lg mt-2">Rp {{ product.price.toLocaleString('id-ID') }} /meter</p>
        <p class="text-sm text-gray-500">{{ product.description }}</p>
        <button
          @click="addToCart(product)"
          :disabled="product.stock === 0"
          class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {{ product.stock === 0 ? 'Stok Habis' : 'Beli' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useCartStore } from '../stores/cart';

const products = ref([]);
const cartStore = useCartStore();

const fetchProducts = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`);
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Tampilkan pesan error ke user
  }
};

const addToCart = (product) => {
  // Panggil aksi addToCart dari Pinia store
  cartStore.addToCart(product);
  // Opsional: feedback visual
  alert(`${product.name} ditambahkan ke keranjang!`);
};

onMounted(() => {
  fetchProducts();
});
</script>