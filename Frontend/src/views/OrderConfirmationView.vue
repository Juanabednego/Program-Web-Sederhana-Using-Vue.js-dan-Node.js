<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto p-4 text-center">
      <div v-if="loading" class="text-center py-12">
        <svg class="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xl text-gray-700">Memuat detail pesanan...</p>
      </div>
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-2xl mx-auto" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
        <p class="text-sm mt-2">Pastikan Anda sudah login dan pesanan dengan ID ini ada.</p>
      </div>
      <div v-else-if="order">
        <h1 class="text-4xl font-bold text-green-600 mb-4">Pesanan Berhasil Dibuat!</h1>
        <p class="text-lg text-gray-700 mb-6">Terima kasih atas pesanan Anda. Detail pesanan Anda:</p>

        <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-left">
          <div class="mb-4">
            <h2 class="text-2xl font-semibold border-b pb-2 mb-2">Detail Pesanan #{{ order._id }}</h2>
            <p><strong>Tanggal Pesanan:</strong> {{ formatDate(order.createdAt) }}</p>
            <p><strong>Status Pembayaran:</strong>
              <span :class="order.isPaid ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'">
                {{ order.isPaid ? `Sudah Dibayar ${order.paidAt ? 'pada ' + formatDate(order.paidAt, true) : ''}` : 'Menunggu Verifikasi' }}
              </span>
            </p>
            <p><strong>Status Pesanan:</strong>
              <span :class="{'font-semibold': true, 'text-yellow-600': order.orderStatus === 'Pending Payment', 'text-blue-600': order.orderStatus === 'Processing' || order.orderStatus === 'Paid', 'text-purple-600': order.orderStatus === 'Shipped', 'text-green-600': order.orderStatus === 'Completed', 'text-red-600': order.orderStatus === 'Cancelled', 'text-gray-600': order.orderStatus === 'Refunded'}">
                {{ order.orderStatus }}
              </span>
            </p>
            <p><strong>Status Pengiriman:</strong>
              <span :class="order.isDelivered ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'">
                {{ order.isDelivered ? `Sudah Dikirim ${order.deliveredAt ? 'pada ' + formatDate(order.deliveredAt, true) : ''}` : 'Belum Dikirim' }}
              </span>
            </p>
          </div>

          <div class="mb-4">
            <h3 class="text-xl font-semibold border-b pb-2 mb-2">Alamat Pengiriman</h3>
            <p>{{ order.shippingAddress.address }}</p>
            <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}</p>
            <p>{{ order.shippingAddress.country }}</p>
          </div>

          <div class="mb-4">
            <h3 class="text-xl font-semibold border-b pb-2 mb-2">Metode Pembayaran</h3>
            <p>{{ order.paymentMethod }}</p>
            <div v-if="order.proofOfTransfer" class="mt-4">
                <p class="font-semibold text-gray-800 mb-2">Bukti Transfer / Pembayaran:</p>
                <a :href="getImageUrl(order.proofOfTransfer)" target="_blank" class="text-blue-600 hover:underline">
                    <img :src="getImageUrl(order.proofOfTransfer)" alt="Bukti Pembayaran" class="max-w-xs h-auto rounded-lg shadow-md border border-gray-200 object-cover">
                    <p class="text-sm mt-1">Klik untuk melihat gambar penuh</p>
                </a>
                <p class="text-sm mt-2 text-gray-600 italic">Pembayaran Anda sedang dalam proses verifikasi.</p>
            </div>
            <div v-else class="mt-4 text-gray-600 italic">
                Tidak ada bukti pembayaran terunggah untuk metode ini.
            </div>
          </div>

          <div class="mb-4">
            <h3 class="text-xl font-semibold border-b pb-2 mb-2">Item Pesanan</h3>
            <div v-for="item in order.orderItems" :key="item.product" class="flex items-center justify-between py-2 border-b last:border-b-0">
              <div class="flex items-center">
                <img :src="item.image" :alt="item.name" class="w-16 h-16 object-cover rounded-md mr-4">
                <div>
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="text-gray-600 text-sm">{{ item.quantity }} x Rp {{ item.price.toLocaleString('id-ID') }}</p>
                </div>
              </div>
              <span class="font-bold">Rp {{ (item.quantity * item.price).toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t-2 border-gray-200">
            <div class="flex justify-between items-center text-lg">
              <span>Subtotal Barang:</span>
              <span class="font-bold">Rp {{ order.itemsPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between items-center text-lg">
              <span>Ongkos Kirim:</span>
              <span class="font-bold">Rp {{ order.shippingPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between items-center text-lg mb-2">
              <span>Pajak:</span>
              <span class="font-bold">Rp {{ order.taxPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between items-center text-2xl font-bold text-blue-700">
              <span>Total Pembayaran:</span>
              <span>Rp {{ order.totalPrice.toLocaleString('id-ID') }}</span>
            </div>
          </div>
          <!-- Cancel Order Section -->
          <div v-if="canCancelOrder(order.orderStatus)" class="mt-6 pt-4 border-t-2 border-gray-200">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-yellow-800 mb-2">Batalkan Pesanan</h4>
              <p class="text-sm text-yellow-700 mb-3">
                Anda masih dapat membatalkan pesanan ini karena statusnya adalah "{{ order.orderStatus }}".
                Setelah dibatalkan, pesanan tidak dapat dikembalikan.
              </p>
              <button
                @click="cancelOrder"
                :disabled="cancellingOrder"
                class="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
              >
                <svg v-if="cancellingOrder" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ cancellingOrder ? 'Membatalkan...' : 'Batalkan Pesanan' }}
              </button>
            </div>
          </div>
          
          <!-- Order Cancelled Message -->
          <div v-else-if="order.orderStatus === 'Cancelled'" class="mt-6 pt-4 border-t-2 border-gray-200">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-red-800 mb-2">Pesanan Dibatalkan</h4>
              <p class="text-sm text-red-700">
                Pesanan ini telah dibatalkan dan tidak dapat diproses lebih lanjut.
              </p>
            </div>
          </div>

          <!-- Order Cannot be Cancelled Message -->
          <div v-else class="mt-6 pt-4 border-t-2 border-gray-200">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="text-lg font-semibold text-blue-800 mb-2">Status Pesanan</h4>
              <p class="text-sm text-blue-700">
                Pesanan dengan status "{{ order.orderStatus }}" tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-center space-x-4">
          <router-link to="/home" class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
            Kembali ke Beranda
          </router-link>
          <router-link to="/pemesanan" class="inline-block bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
            Lihat Semua Pesanan
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../url';

// Import BE_PRE_URL

const route = useRoute();
const router = useRouter();
const orderId = route.params.orderId; 

const order = ref(null);
const loading = ref(true);
const error = ref(null);
const cancellingOrder = ref(false);

// Helper function untuk mendapatkan token dari localStorage
const getTokenFromLocalStorage = () => {
  try {
    const token = localStorage.getItem('jwt') || localStorage.getItem('token');
    return token;
  } catch (err) {
    console.error('[OrderConfirmation] Error getting token from localStorage:', err);
    return null;
  }
};

function getUserInfoFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = getTokenFromLocalStorage();
  console.log('[OrderConfirmation] Attempting to get user info from localStorage...');
  console.log('  userData found:', !!user);
  console.log('  jwt token found:', !!token);

  if (!user || !token) {
    console.warn('[OrderConfirmation] User data or JWT token is missing in localStorage.');
    return null;
  }

  try {
    const parsedUser = JSON.parse(user);
    parsedUser.token = token; 
    console.log('[OrderConfirmation] Successfully retrieved user info with token:', parsedUser);
    return parsedUser;
  } catch (e) {
    console.error('[OrderConfirmation] Error parsing user data from localStorage:', e);
    return null;
  }
}

const fetchOrder = async () => {
  console.log(`[OrderConfirmation] Attempting to fetch order with ID: ${orderId}`);
  loading.value = true;
  error.value = null;

  try {
    const userInfo = getUserInfoFromLocalStorage(); 
    
    if (!userInfo || !userInfo.token) {
      console.error('[OrderConfirmation] No valid user info or token found to fetch order.');
      throw new Error('Anda harus login untuk melihat detail pesanan ini. Token autentikasi tidak ditemukan.');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    console.log(`[OrderConfirmation] Sending GET request to: http://${BE_PRE_URL}/orders/${orderId}`);
    console.log('[OrderConfirmation] Authorization Header:', config.headers.Authorization);

    const { data } = await axios.get(`http://${BE_PRE_URL}/orders/${orderId}`, config);
    order.value = data;
    console.log('[OrderConfirmation] Order data fetched successfully:', data);

  } catch (err) {
    console.error('[OrderConfirmation] Error fetching order:', err);
    
    if (err.response) {
      console.error('[OrderConfirmation] Server Response Error:', err.response.data);
      console.error('[OrderConfirmation] Status:', err.response.status);
      error.value = err.response.data.message || 'Terjadi kesalahan saat mengambil detail pesanan dari server.';

      if (err.response.status === 401) {
        alert('Sesi Anda telah berakhir. Harap login kembali.');
        localStorage.removeItem('userData'); 
        localStorage.removeItem('jwt'); 
        localStorage.removeItem('token');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      } else if (err.response.status === 404) {
        error.value = 'Pesanan tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.';
      }
    } else if (err.request) {
      console.error('[OrderConfirmation] Network Error (No response from server):', err.request);
      error.value = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } else {
      console.error('[OrderConfirmation] Axios Error (Request setup issue):', err.message);
      error.value = err.message || 'Terjadi kesalahan tidak terduga.';
    }
  } finally {
    loading.value = false;
    console.log('[OrderConfirmation] Order fetch process finished.');
  }
};

// Cancel order function
const cancelOrder = async () => {
  console.log(`[OrderConfirmation] Attempting to cancel order: ${orderId}`);
  
  if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.')) {
    return;
  }

  cancellingOrder.value = true;

  try {
    const token = getTokenFromLocalStorage();
    
    if (!token) {
      throw new Error('Token autentikasi tidak ditemukan.');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Menggunakan endpoint yang benar sesuai backend
    const url = `http://${BE_PRE_URL}/orders/${orderId}/cancel-customer`;
    console.log(`[OrderConfirmation] Sending PUT request to: ${url}`);

    const { data } = await axios.put(url, {}, config);
    
    console.log('[OrderConfirmation] Order cancelled successfully:', data);
    
    // Update local state
    order.value.orderStatus = 'Cancelled';

    alert('Pesanan berhasil dibatalkan!');

  } catch (err) {
    console.error('[OrderConfirmation] Error cancelling order:', err);
    
    let errorMessage = 'Gagal membatalkan pesanan.';
    
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    alert(errorMessage);
  } finally {
    cancellingOrder.value = false;
  }
};

// Helper function to check if order can be cancelled
const canCancelOrder = (status) => {
  return ['Pending Payment', 'Processing'].includes(status);
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.second = '2-digit'; 
  }
  return date.toLocaleDateString('id-ID', options);
};

const getImageUrl = (imagePath) => {
  // Logic to construct the correct base URL for static files
  // Assuming BE_PRE_URL from '../url' is 'localhost:9001/api/v1'
  // We want 'http://localhost:9001'
  const baseUrl = `http://${BE_PRE_URL}`.replace('/api/v1', '');
  console.log('[OrderConfirmation] Generating image URL for:', imagePath, 'Base URL used:', baseUrl);
  // Ensure imagePath starts with '/', if not, add it
  const finalImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${finalImagePath}`;
};

onMounted(() => {
  console.log('[OrderConfirmation] Component mounted. Order ID from route:', orderId);
  if (orderId) {
    fetchOrder();
  } else {
    error.value = 'ID Pesanan tidak ditemukan di URL.';
    loading.value = false;
    console.error('[OrderConfirmation] No orderId found in URL parameters.');
  }
});
</script>

<style scoped>
/* */
</style>