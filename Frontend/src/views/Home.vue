<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
      <div class="container mx-auto px-4">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">
            Katalog Pipa Terbaik
          </h1>
          <p class="text-xl md:text-2xl mb-8 opacity-90">
            Temukan pipa berkualitas tinggi untuk kebutuhan Anda
          </p>
          <div class="flex justify-center items-center space-x-4">
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span class="text-sm font-medium">Kualitas Terjamin</span>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span class="text-sm font-medium">Harga Kompetitif</span>
            </div>
            <div class="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
              <span class="text-sm font-medium">Dipercaya</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    

    <div class="container mx-auto px-4 py-12">
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="loader mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg">Memuat katalog pipa...</p>
        </div>
      </div>

      <div v-else-if="error" class="max-w-md mx-auto text-center py-20">
        <div class="bg-red-50 border border-red-200 rounded-lg p-8">
          <div class="text-red-500 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h3>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button 
            @click="fetchPipes" 
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>

      <div v-else-if="pipes.length === 0" class="text-center py-20">
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2a2 2 0 00-2 2v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3a2 2 0 00-2-2H4"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Belum Ada Pipa</h3>
          <p class="text-gray-600">Katalog pipa akan segera tersedia</p>
        </div>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ pipes.length }}</div>
            <div class="text-gray-600">Total Produk</div>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ availablePipes }}</div>
            <div class="text-gray-600">Tersedia</div>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div class="text-3xl font-bold text-purple-600 mb-2">{{ uniqueTypes }}</div>
            <div class="text-gray-600">Jenis Pipa</div>
          </div>
          <div class="bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform">
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ formatPrice(averagePrice) }}</div>
            <div class="text-gray-600">Harga Rata-rata</div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div class="flex flex-wrap gap-4 items-center">
            <div class="flex-1 min-w-64">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Cari pipa berdasarkan nama, jenis, atau material..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            </div>
            <select 
              v-model="filterType" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Jenis</option>
              <option value="PVC">PVC</option>
              <option value="HDPE">HDPE</option>
              <option value="PPR">PPR</option>
              <option value="Besi">Besi</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <select 
              v-model="filterStatus" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Habis Stok">Habis Stok</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="pipe in filteredPipes" 
            :key="pipe._id"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
          >
            <div class="relative h-48 bg-gray-200 overflow-hidden">
              <img 
                v-if="pipe.imageUrl" 
                :src="pipe.imageUrl" 
                :alt="pipe.pipeName"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                @error="handleImageError"
                loading="lazy" 
              >
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              
              <div class="absolute top-3 right-3">
                <span 
                  :class="getStatusBadgeClass(pipe.status)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ pipe.status }}
                </span>
              </div>

              <div class="absolute top-3 left-3">
                <span 
                  :class="getTypeBadgeClass(pipe.pipeType)"
                  class="px-2 py-1 text-xs font-medium rounded-full text-white"
                >
                  {{ pipe.pipeType }}
                </span>
              </div>
            </div>

            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                {{ pipe.pipeName }}
              </h3>
              
              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Diameter:</span>
                  <span class="font-medium">{{ pipe.diameter }}mm</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Panjang:</span>
                  <span class="font-medium">{{ pipe.length }}m</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Kelas:</span>
                  <span class="font-medium">{{ pipe.pipeClass }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Material:</span>
                  <span class="font-medium">{{ pipe.material }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Warna:</span>
                  <span class="font-medium">{{ pipe.color }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">Stok:</span>
                  <span class="font-medium">{{ pipe.stock }} unit</span>
                </div>
              </div>

              <div class="flex items-center justify-between mb-4">
                <span class="text-2xl font-bold text-green-600">
                  {{ formatPrice(pipe.pricePerMeter) }}
                </span>
                <span class="text-gray-500 text-sm">/meter</span>
              </div>

              <p v-if="pipe.description" class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ pipe.description }}
              </p>

              <button 
                @click="handleBuyClick(pipe)"
                :disabled="pipe.status !== 'Aktif' || pipe.stock === 0"
                :class="{
                  'bg-blue-600 hover:bg-blue-700 text-white': pipe.status === 'Aktif' && pipe.stock > 0,
                  'bg-gray-300 text-gray-500 cursor-not-allowed': pipe.status !== 'Aktif' || pipe.stock === 0
                }"
                class="w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                {{ pipe.status !== 'Aktif' || pipe.stock === 0 ? 'Tidak Tersedia' : 'Beli Sekarang' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredPipes.length === 0 && pipes.length > 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Tidak Ada Hasil</h3>
          <p class="text-gray-600">Coba ubah kata kunci pencarian atau filter</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import BE_PRE_URL from '../url' // Pastikan file ini ada dan berisi URL dasar backend Anda

// *** IMPORT TAMBAHAN YANG DIPERLUKAN ***
import { useRouter } from 'vue-router' // Import useRouter untuk navigasi
import { useCartStore } from '../stores/cart' 


// Reactive states
const loading = ref(true)
const error = ref(null)
const pipes = ref([])
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')

// *** INISIALISASI ROUTER DAN STORE ***
const router = useRouter() // Inisialisasi router
const cartStore = useCartStore() // Inisialisasi cart store

// Computed properties
const availablePipes = computed(() => {
  return pipes.value.filter(pipe => pipe.status === 'Aktif' && pipe.stock > 0).length
})

const uniqueTypes = computed(() => {
  const types = [...new Set(pipes.value.map(pipe => pipe.pipeType))]
  return types.length
})

const averagePrice = computed(() => {
  if (pipes.value.length === 0) return 0
  const total = pipes.value.reduce((sum, pipe) => sum + pipe.pricePerMeter, 0)
  return Math.round(total / pipes.value.length)
})

const filteredPipes = computed(() => {
  let filtered = pipes.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(pipe =>
      pipe.pipeName.toLowerCase().includes(query) ||
      pipe.pipeType.toLowerCase().includes(query) ||
      pipe.material.toLowerCase().includes(query) ||
      (pipe.description && pipe.description.toLowerCase().includes(query))
    )
  }

  // Filter by type
  if (filterType.value) {
    filtered = filtered.filter(pipe => pipe.pipeType === filterType.value)
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(pipe => pipe.status === filterStatus.value)
  }

  return filtered
})

// Methods
const fetchPipes = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get(`http://${BE_PRE_URL}/pipa`)
    pipes.value = response.data
  } catch (err) {
    console.error('Fetch pipes error:', err)
    error.value = err.response?.data?.message || `Gagal memuat data pipa. Pastikan backend berjalan dan dapat diakses di http://${BE_PRE_URL}/pipa. Cek konsol browser untuk detail lebih lanjut.`
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'Aktif': 'bg-green-100 text-green-800',
    'Tidak Aktif': 'bg-red-100 text-red-800',
    'Habis Stok': 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'PVC': 'bg-blue-500',
    'HDPE': 'bg-green-500',
    'PPR': 'bg-purple-500',
    'Besi': 'bg-gray-600',
    'Lainnya': 'bg-orange-500'
  }
  return classes[type] || 'bg-gray-500'
}

const handleImageError = (event) => {
  event.target.style.display = 'none';
  if (event.target.nextElementSibling) {
    event.target.nextElementSibling.style.display = 'flex';
  }
}

// Fungsi handleBuyClick yang diperbaiki
const handleBuyClick = (pipe) => {
  if (pipe.status === 'Aktif' && pipe.stock > 0) {
    // Siapkan objek produk sesuai format yang diharapkan oleh cart store
    // Berdasarkan cart.js Anda, ia mengharapkan { product: { _id, name, price, image, ... }, quantity }
    const productForCart = {
      _id: pipe._id,
      name: pipe.pipeName,
      price: pipe.pricePerMeter, // Menggunakan pricePerMeter sebagai 'price' di item keranjang
      imageUrl: pipe.imageUrl,
      stock: pipe.stock,
      // Tambahkan properti lain dari 'pipe' yang mungkin berguna di keranjang
      diameter: pipe.diameter,
      length: pipe.length,
      pipeClass: pipe.pipeClass,
      material: pipe.material,
      color: pipe.color,
    };

    // Tambahkan produk ke keranjang
    cartStore.addToCart(productForCart, 1); // Tambahkan 1 unit

    // Opsional: Beri notifikasi kecil (misal, toast/snackbar) alih-alih alert
    // alert(`"${pipe.pipeName}" telah ditambahkan ke keranjang Anda!`);
    console.log(`"${pipe.pipeName}" telah ditambahkan ke keranjang.`);

    // Arahkan ke halaman keranjang setelah ditambahkan
    router.push({ path: '/cart' }); // Menggunakan path '/cart' sesuai router Anda
    // Atau bisa juga: router.push({ name: 'cart' });
  } else {
    // Pesan ini hanya sebagai fallback, karena tombol seharusnya sudah di-disable
    alert(`Produk "${pipe.pipeName}" tidak tersedia untuk dibeli.`);
  }
};


// Lifecycle hook
onMounted(() => {
  fetchPipes()
  cartStore.loadCartFromLocalStorage() // Memuat item keranjang saat komponen dimount
})
</script>

<style scoped>
.loader {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>