<template>
  <div v-if="isCheckingLogin" class="min-h-screen flex items-center justify-center">
    <p class="text-gray-600 text-lg">Memuat halaman checkout...</p>
  </div>

  <div v-else class="min-h-screen bg-gray-100 py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Selesaikan Pembelian Anda</h1>

      <div class="mb-4">
        <button @click="goBackToCart" class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
          ← Kembali ke Keranjang
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold mb-4">1. Informasi Pengiriman</h2>
          <form @submit.prevent="submitOrder">
            <div class="mb-4">
              <label class="block mb-1">Alamat Lengkap</label>
              <input v-model="shippingAddress.address" required class="w-full border p-2 rounded" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1">Kota</label>
                <input v-model="shippingAddress.city" required class="w-full border p-2 rounded" />
              </div>
              <div>
                <label class="block mb-1">Kode Pos</label>
                <input v-model="shippingAddress.postalCode" required class="w-full border p-2 rounded" />
              </div>
            </div>
            <div class="mt-4">
              <label class="block mb-1">Negara</label>
              <input v-model="shippingAddress.country" required class="w-full border p-2 rounded" />
            </div>

            <div class="mb-4 mt-6">
              <h2 class="text-2xl font-semibold mb-4">2. Metode Pembayaran</h2>
              <label class="block mb-1">Pilih Metode Pembayaran</label>
              <select v-model="paymentMethod" class="w-full border p-2 rounded" required>
                <option disabled value="">-- Pilih Metode Pembayaran --</option>
                <option value="Transfer Bank">Transfer Bank (BCA)</option>
                <option value="Dana">Dana</option>
                <option value="OVO">OVO</option>
              </select>
            </div>

            <div v-if="paymentMethod" class="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4">
              <template v-if="paymentMethod === 'Transfer Bank'">
                Silakan transfer ke <strong>BCA 123456789</strong>
              </template>
              <template v-else-if="paymentMethod === 'Dana'">
                Kirim pembayaran ke <strong>0812-3456-7890</strong>
              </template>
              <template v-else-if="paymentMethod === 'OVO'">
                Kirim pembayaran ke <strong>0812-9876-5432</strong>
              </template>
            </div>

            <div class="mt-4" v-if="paymentMethod === 'Transfer Bank' || paymentMethod === 'Dana' || paymentMethod === 'OVO'">
              <label>Bukti Transfer / Pembayaran (JPG/PNG/GIF, maks 5MB)</label>
              <input
                type="file"
                @change="handleFileUpload"
                accept="image/*"
                :required="requiresProof"
                class="block mt-1"
              />
              <p v-if="proofOfTransferFile" class="text-sm mt-1">File: {{ proofOfTransferFile.name }}</p>
              <p v-if="fileError" class="text-red-500">{{ fileError }}</p>
            </div>

            <div class="mt-4">
              <input type="checkbox" v-model="agreedToTerms" required class="mr-2" />
              <label>Saya menyetujui syarat & ketentuan</label>
            </div>

            <button type="submit" class="mt-4 w-full bg-blue-600 text-white p-3 rounded"
              :disabled="!agreedToTerms || (requiresProof && !proofOfTransferFile) || loading">
              {{ loading ? 'Memproses...' : 'Bayar Sekarang' }}
            </button>

            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
          </form>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
          <div v-for="item in cartStore.items" :key="item.product._id" class="flex justify-between mb-2">
            <span>{{ item.product.name }} x{{ item.quantity }}</span>
            <span>Rp {{ (item.product.price * item.quantity).toLocaleString('id-ID') }}</span>
          </div>
          <hr class="my-2" />
          <div class="flex justify-between">
            <span>Subtotal Barang</span>
            <span>Rp {{ cartStore.cartSubtotal.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between">
            <span>Pajak ({{ (taxRate * 100) }}%)</span>
            <span>Rp {{ taxPrice.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between">
            <span>Ongkir</span>
            <span>Rp {{ shippingPrice.toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
            <span>Total Pembayaran</span>
            <span>Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cart';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../url/index.js';

const router = useRouter();
const cartStore = useCartStore();

const shippingAddress = ref({ address: '', city: '', postalCode: '', country: 'Indonesia' });
const paymentMethod = ref('Transfer Bank'); // Default value
const agreedToTerms = ref(false);
const loading = ref(false);
const error = ref(null);
const fileError = ref(null);
const proofOfTransferFile = ref(null);

const shippingPrice = ref(10000); // Contoh biaya ongkir
const taxRate = ref(0.10); // Pajak 10%

const isCheckingLogin = ref(true);
const userInfo = ref(null);

// Computed properties for price calculations
const itemsPrice = computed(() => cartStore.cartSubtotal);
const taxPrice = computed(() => itemsPrice.value * taxRate.value);
const totalPrice = computed(() => itemsPrice.value + shippingPrice.value + taxPrice.value);

const requiresProof = computed(() => {
  const methodsRequiringProof = ['Transfer Bank', 'Dana', 'OVO'];
  return methodsRequiringProof.includes(paymentMethod.value);
});

const goBackToCart = () => router.push('/cart');

// Helper: Ambil user dan token dari localStorage
function getUserFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = localStorage.getItem('jwt');
  console.log('[CheckoutView] Getting user from local storage:');
  console.log('  userData:', user ? JSON.parse(user) : 'Not found');
  console.log('  jwt token:', token ? 'Found (length: ' + token.length + ')' : 'Not found');

  if (!user || !token) {
    console.log('[CheckoutView] User data or token not found in local storage.');
    return null;
  }

  try {
    const parsed = JSON.parse(user);
    parsed.token = token;
    console.log('[CheckoutView] Parsed user info:', parsed);
    return parsed;
  } catch (e) {
    console.error('[CheckoutView] Error parsing user data from local storage:', e);
    return null;
  }
}

onMounted(() => {
  console.log('[CheckoutView] onMounted: Starting login check and cart load...');
  const storedUser = getUserFromLocalStorage();

  if (!storedUser || !storedUser.token) {
    console.log('[CheckoutView] User not logged in or token missing. Redirecting to login.');
    alert('Anda harus login untuk melakukan pembelian.');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  userInfo.value = storedUser;
  console.log('[CheckoutView] User is logged in. User ID:', userInfo.value._id);


  cartStore.loadCartFromLocalStorage();
  console.log('[CheckoutView] Cart loaded. Items in cart:', cartStore.items.length);


  if (cartStore.items.length === 0) {
    console.warn('[CheckoutView] Cart is empty. Redirecting to products page.');
    alert('Keranjang belanja Anda kosong, silakan tambahkan produk.');
    router.push('/products');
    return;
  }

  isCheckingLogin.value = false;
  console.log('[CheckoutView] Checkout page ready.');
});

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  fileError.value = null;
  console.log('[CheckoutView] File selected for upload:', file ? file.name : 'No file');

  const allowed = ['image/jpeg', 'image/png', 'image/gif'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  if (file) {
    if (!allowed.includes(file.type)) {
      fileError.value = 'Hanya file gambar (JPG, PNG, GIF) yang diizinkan.';
      proofOfTransferFile.value = null;
      console.warn('[CheckoutView] File type not allowed:', file.type);
    } else if (file.size > maxFileSize) {
      fileError.value = `Ukuran file maksimal 5MB. File Anda ${Math.round(file.size / 1024 / 1024)}MB.`;
      proofOfTransferFile.value = null;
      console.warn('[CheckoutView] File size too large:', file.size);
    } else {
      proofOfTransferFile.value = file;
      console.log('[CheckoutView] Valid file selected:', file.name, 'Size:', file.size, 'bytes');
    }
  } else {
    proofOfTransferFile.value = null;
    console.log('[CheckoutView] File input cleared.');
  }
};

const submitOrder = async () => {
  console.log('[CheckoutView] Submitting order...');
  console.log('  Current userInfo:', userInfo.value);
  console.log('  Token for Authorization:', userInfo.value?.token ? 'Exists' : 'MISSING/NULL');
  console.log('  Shipping Address:', shippingAddress.value);
  console.log('  Payment Method:', paymentMethod.value);
  console.log('  Requires Proof:', requiresProof.value);
  console.log('  Proof File Selected:', proofOfTransferFile.value ? proofOfTransferFile.value.name : 'NONE');
  console.log('  Agreed to Terms:', agreedToTerms.value);
  console.log('  Cart Items Count:', cartStore.items.length);


  if (!userInfo.value || !userInfo.value.token) {
    error.value = 'Anda belum login atau sesi Anda telah berakhir. Silakan login kembali.';
    console.error('[CheckoutView] Submit aborted: User not logged in or token missing.');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  if (!shippingAddress.value.address || !shippingAddress.value.city || !shippingAddress.value.postalCode || !shippingAddress.value.country) {
    error.value = 'Mohon lengkapi semua informasi pengiriman.';
    console.error('[CheckoutView] Submit aborted: Missing shipping address info.');
    return;
  }

  if (!paymentMethod.value) {
    error.value = 'Mohon pilih metode pembayaran.';
    console.error('[CheckoutView] Submit aborted: Payment method not selected.');
    return;
  }

  if (requiresProof.value && !proofOfTransferFile.value) {
    error.value = 'Mohon upload bukti pembayaran.';
    console.error('[CheckoutView] Submit aborted: Proof of payment required but not uploaded.');
    return;
  }

  if (!agreedToTerms.value) {
    error.value = 'Anda harus menyetujui syarat & ketentuan.';
    console.error('[CheckoutView] Submit aborted: Terms not agreed.');
    return;
  }

  if (cartStore.items.length === 0) {
    error.value = 'Keranjang belanja Anda kosong.';
    console.error('[CheckoutView] Submit aborted: Cart is empty.');
    return;
  }

  loading.value = true;
  error.value = null;
  console.log('[CheckoutView] All frontend validations passed. Preparing for API call.');

  try {
    const formData = new FormData();

    formData.append('shippingAddress', JSON.stringify(shippingAddress.value));
    formData.append('paymentMethod', paymentMethod.value);
    formData.append('itemsPrice', itemsPrice.value);
    formData.append('shippingPrice', shippingPrice.value);
    formData.append('taxPrice', taxPrice.value);
    formData.append('totalPrice', totalPrice.value);

    formData.append('orderItems', JSON.stringify(cartStore.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image || '',
    }))));

    if (requiresProof.value && proofOfTransferFile.value) {
      formData.append('proofOfTransfer', proofOfTransferFile.value);
      console.log('[CheckoutView] Proof of transfer file appended to FormData.');
    }
    
    // Log FormData contents (for debugging, can be verbose)
    console.log('[CheckoutView] FormData contents:');
    for (let pair of formData.entries()) {
        if (pair[0] === 'proofOfTransfer' && typeof pair[1] === 'object') {
            console.log(`  ${pair[0]}: File object (name: ${pair[1].name}, type: ${pair[1].type}, size: ${pair[1].size})`);
        } else {
            console.log(`  ${pair[0]}: ${pair[1]}`);
        }
    }


    console.log(`[CheckoutView] Sending POST request to: http://${BE_PRE_URL}/orders`);
    const { data } = await axios.post(
      `http://${BE_PRE_URL}/orders`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.value.token}`
        }
      }
    );

    console.log('[CheckoutView] Order successfully created:', data);
    cartStore.clearCart();
    alert('Pesanan berhasil dibuat!');
    router.push({ name: 'orderConfirmation', params: { orderId: data._id } });

  } catch (err) {
    console.error('[CheckoutView] Gagal submit pesanan:', err);
    if (err.response) {
      // Server responded with a status other than 2xx
      console.error('[CheckoutView] Server Response Error:', err.response.data);
      console.error('[CheckoutView] Status:', err.response.status);
      console.error('[CheckoutView] Headers:', err.response.headers);
      error.value = err.response.data.message || 'Terjadi kesalahan dari server.';
    } else if (err.request) {
      // Request was made but no response was received
      console.error('[CheckoutView] Network Error (No response from server):', err.request);
      error.value = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[CheckoutView] Axios Error (Request setup issue):', err.message);
      error.value = err.message || 'Terjadi kesalahan tidak terduga.';
    }
  } finally {
    loading.value = false;
    console.log('[CheckoutView] Order submission process finished.');
  }
};
</script>

<style scoped>
/* Your existing styles */
</style>