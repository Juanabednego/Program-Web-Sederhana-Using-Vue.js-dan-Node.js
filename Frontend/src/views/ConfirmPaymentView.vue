<template>
  <div class="container mx-auto p-4 bg-gray-100 min-h-screen">
    <div class="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-10">
      <h1 class="text-3xl font-bold text-center text-blue-700 mb-6">Konfirmasi Pembayaran</h1>

      <div v-if="isLoading" class="text-center py-8">
        <p class="text-lg text-gray-600">Memverifikasi tautan pembayaran Anda...</p>
        <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mt-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="error" class="text-center py-8 text-red-600">
        <p class="text-xl font-semibold">{{ error }}</p>
        <p class="mt-4">Silakan periksa kembali tautan yang Anda terima di email atau hubungi kami.</p>
        <router-link to="/" class="inline-block mt-4 text-blue-600 hover:underline">Kembali ke Halaman Utama</router-link>
      </div>

      <div v-else-if="order" class="space-y-6">
        <h2 class="text-2xl font-semibold text-gray-800 border-b pb-3 mb-4">Detail Pesanan #{{ order._id }}</h2>
        <p class="text-gray-700"><strong>Status Pesanan:</strong>
          <span :class="getStatusClass(order.orderStatus)" class="ml-2 px-3 py-1 rounded-full text-sm font-medium">
            {{ order.orderStatus }}
          </span>
        </p>
        <p class="text-gray-700"><strong>Metode Pembayaran:</strong> {{ order.paymentMethod }}</p>
        <p class="text-gray-700"><strong>Tanggal Pesanan:</strong> {{ formatDate(order.createdAt) }}</p>
        <p class="text-gray-700 font-bold text-xl">
          Total yang Harus Dibayar: <span class="text-blue-600">Rp {{ formatPrice(order.totalPrice) }}</span>
        </p>

        <h3 class="text-xl font-semibold text-gray-800 mt-8 border-b pb-2">Daftar Produk:</h3>
        <ul class="list-disc pl-5">
          <li v-for="item in order.orderItems" :key="item.product" class="text-gray-700">
            {{ item.name }} ({{ item.quantity }}x) - Rp {{ formatPrice(item.price * item.quantity) }}
          </li>
        </ul>

        <div v-if="order.orderStatus === 'Pending Payment'" class="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 class="text-2xl font-semibold text-blue-800 mb-4 text-center">Unggah Bukti Transfer</h3>
          <p class="text-gray-700 mb-4 text-center">Mohon unggah bukti transfer Anda untuk melanjutkan pesanan.</p>

          <input type="file" @change="handleFileUpload" accept="image/*" class="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100" />
          <p v-if="uploadError" class="text-red-500 text-sm mt-2">{{ uploadError }}</p>
          <p v-if="uploadSuccess" class="text-green-600 text-sm mt-2">{{ uploadSuccess }}</p>

          <button @click="submitProofOfTransfer" :disabled="isUploading || !selectedFile"
            class="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
            :class="{ 'opacity-50 cursor-not-allowed': isUploading || !selectedFile }">
            {{ isUploading ? 'Mengunggah...' : 'Unggah Bukti Transfer' }}
          </button>
          <div v-if="order.proofOfTransferImage" class="mt-4 text-center">
            <p class="text-gray-600 text-sm">Bukti transfer yang sudah diunggah:</p>
            <img :src="order.proofOfTransferImage" alt="Bukti Transfer" class="max-w-xs mx-auto mt-2 rounded-lg shadow-md" />
          </div>
        </div>
        <div v-else class="mt-8 bg-green-50 p-6 rounded-lg border border-green-200 text-center">
          <p class="text-xl font-semibold text-green-800">Pembayaran Anda sedang diproses atau sudah dikonfirmasi.</p>
          <p class="text-gray-700 mt-2">Terima kasih atas konfirmasinya!</p>
          <router-link to="/pemesanan" class="inline-block mt-4 text-blue-600 hover:underline">Lihat Pesanan Saya</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../url/index.js';

const route = useRoute();
const router = useRouter();

const order = ref(null);
const isLoading = ref(true);
const error = ref(null);
const selectedFile = ref(null);
const isUploading = ref(false);
const uploadError = ref(null);
const uploadSuccess = ref(null);

// Mengambil query params dari URL
const orderId = route.query.orderId;
const token = route.query.token;

onMounted(() => {
  console.log('[ConfirmPaymentView] Component mounted.');
  console.log('[ConfirmPaymentView] Order ID from URL:', orderId);
  console.log('[ConfirmPaymentView] Token from URL:', token);

  if (!orderId || !token) {
    console.error('[ConfirmPaymentView] Order ID atau Token tidak ditemukan di URL.');
    error.value = 'Tautan konfirmasi tidak lengkap. Order ID atau Token tidak ditemukan.';
    isLoading.value = false;
    router.push({ name: 'tokenInvalid' });
    return;
  }
  fetchOrderDetails();
});

const fetchOrderDetails = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    console.log(`[ConfirmPaymentView] Fetching order details for orderId: ${orderId} with token: ${token}`);
    console.log(`[ConfirmPaymentView] API URL: http://${BE_PRE_URL}/orders/${orderId}/verify-token?token=${token}`);
    const { data } = await axios.get(`http://${BE_PRE_URL}/orders/${orderId}/verify-token?token=${token}`);
    order.value = data;
    if (order.value.orderStatus !== 'Pending Payment') {
      uploadSuccess.value = 'Pesanan ini sudah tidak dalam status "Pending Payment".';
    }
    console.log('[ConfirmPaymentView] Order details fetched successfully:', data);
  } catch (err) {
    console.error('[ConfirmPaymentView] Gagal memverifikasi token atau mengambil detail pesanan:', err);
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    } else {
      error.value = 'Terjadi kesalahan saat memverifikasi tautan.';
    }
 
    if (err.response && (err.response.status === 400 || err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
      console.log('[ConfirmPaymentView] Redirecting to tokenInvalid due to backend error status.');
      router.push({ name: 'tokenInvalid' });
    }
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  selectedFile.value = file;
  uploadError.value = null;
  uploadSuccess.value = null;

  const allowed = ['image/jpeg', 'image/png', 'image/gif'];
  const maxFileSize = 5 * 1024 * 1024;

  if (file) {
    if (!allowed.includes(file.type)) {
      uploadError.value = 'Hanya file gambar (JPG, PNG, GIF) yang diizinkan.';
      selectedFile.value = null;
    } else if (file.size > maxFileSize) {
      uploadError.value = `Ukuran file maksimal 5MB. File Anda ${Math.round(file.size / 1024 / 1024)}MB.`;
      selectedFile.value = null;
    }
  }
};

const submitProofOfTransfer = async () => {
  if (!selectedFile.value) {
    uploadError.value = 'Mohon pilih file bukti transfer.';
    return;
  }

  isUploading.value = true;
  uploadError.value = null;
  uploadSuccess.value = null;

  const formData = new FormData();
  formData.append('proofOfTransferImage', selectedFile.value);
  formData.append('token', token); 

  try {
    console.log(`[ConfirmPaymentView] Submitting proof of transfer for orderId: ${orderId}`);
    console.log(`[ConfirmPaymentView] API URL: http://${BE_PRE_URL}/orders/${orderId}/upload-proof`);
    const { data } = await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/upload-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    uploadSuccess.value = data.message || 'Bukti transfer berhasil diunggah! Pesanan Anda akan segera diproses.';
    order.value.orderStatus = data.order.orderStatus;
    order.value.proofOfTransferImage = data.order.proofOfTransferImage; 
    console.log('[ConfirmPaymentView] Proof of transfer uploaded successfully:', data);
  
  } catch (err) {
    console.error('[ConfirmPaymentView] Gagal mengunggah bukti transfer:', err);
    if (err.response && err.response.data && err.response.data.message) {
      uploadError.value = err.response.data.message;
    } else {
      uploadError.value = 'Terjadi kesalahan saat mengunggah bukti transfer.';
    }
    if (err.response && (err.response.status === 400 || err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
      console.log('[ConfirmPaymentView] Redirecting to tokenInvalid due to backend error status during upload.');
      router.push({ name: 'tokenInvalid' });
    }
  } finally {
    isUploading.value = false;
  }
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('id-ID').format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const getStatusClass = (status) => {
  switch (status) {
    case 'Pending Payment': return 'bg-yellow-100 text-yellow-800';
    case 'Processing': return 'bg-blue-100 text-blue-800';
    case 'Shipped': return 'bg-purple-100 text-purple-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Cancelled':
    case 'Cancelled by Customer': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
</script>

<style scoped>

</style>
