<!-- src/pages/Checkout.vue -->
<template>
  <!-- Loading state for initial login check -->
  <q-page v-if="isCheckingLogin" class="flex flex-center bg-grey-2">
    <q-spinner-dots color="primary" size="3em" />
    <div class="text-h6 text-grey-7 q-ml-md">Memuat halaman checkout...</div>
  </q-page>

  <!-- Main Checkout Page -->
  <q-page v-else class="q-pa-md bg-grey-2">
    <div class="q-mx-auto q-px-md q-py-lg" style="max-width: 1200px;">
      <div class="text-h4 text-weight-bold text-grey-9 q-mb-lg text-center">Selesaikan Pembelian Anda</div>

      <!-- Back to Cart Button -->
      <div class="q-mb-md">
        <q-btn
          @click="goBackToCart"
          color="grey-6"
          text-color="dark"
          icon="arrow_back"
          label="Kembali ke Keranjang"
          flat
          rounded
          class="q-px-md q-py-sm"
        />
      </div>

      <div class="row q-col-gutter-md">
        <!-- Shipping Information & Payment Method (Left Column) -->
        <div class="col-12 col-lg-8">
          <q-card class="shadow-2 rounded-borders q-pa-lg">
            <q-card-section>
              <div class="text-h5 text-weight-semibold q-mb-md">1. Informasi Pengiriman</div>
              <q-form @submit.prevent="submitOrder" class="q-gutter-md">
                <q-input
                  filled
                  v-model="shippingAddress.address"
                  label="Alamat Lengkap"
                  type="textarea"
                  rows="3"
                  lazy-rules
                  :rules="[val => (val && val.length > 0) || 'Alamat tidak boleh kosong']"
                />
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <q-input
                      filled
                      v-model="shippingAddress.city"
                      label="Kota"
                      lazy-rules
                      :rules="[val => (val && val.length > 0) || 'Kota tidak boleh kosong']"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      filled
                      v-model="shippingAddress.postalCode"
                      label="Kode Pos"
                      lazy-rules
                      :rules="[val => (val && val.length > 0) || 'Kode Pos tidak boleh kosong']"
                    />
                  </div>
                </div>
                <q-input
                  filled
                  v-model="shippingAddress.country"
                  label="Negara"
                  lazy-rules
                  :rules="[val => (val && val.length > 0) || 'Negara tidak boleh kosong']"
                />

                <div class="q-mt-xl">
                  <div class="text-h5 text-weight-semibold q-mb-md">2. Metode Pembayaran</div>
                  <q-select
                    filled
                    v-model="paymentMethod"
                    :options="['Transfer Bank', 'Dana', 'OVO']"
                    label="Pilih Metode Pembayaran"
                    emit-value
                    map-options
                    lazy-rules
                    :rules="[val => (val && val.length > 0) || 'Metode pembayaran harus dipilih']"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          Tidak ada opsi
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <q-banner v-if="paymentMethod" class="bg-blue-1 text-blue-8 q-pa-md rounded-borders q-mt-md">
                  <template v-if="paymentMethod === 'Transfer Bank'">
                    Silakan transfer ke <strong>BCA 123456789</strong>
                  </template>
                  <template v-else-if="paymentMethod === 'Dana'">
                    Kirim pembayaran ke <strong>0812-3456-7890</strong>
                  </template>
                  <template v-else-if="paymentMethod === 'OVO'">
                    Kirim pembayaran ke <strong>0812-9876-5432</strong>
                  </template>
                  <p class="q-mt-sm text-caption">Anda akan menerima email invoice dengan instruksi pembayaran dan link untuk mengunggah bukti transfer.</p>
                </q-banner>

                <q-checkbox v-model="agreedToTerms" label="Saya menyetujui syarat & ketentuan" class="q-mt-md" />

                <q-btn
                  type="submit"
                  color="primary"
                  :label="loading ? 'Memproses Pesanan...' : 'Buat Pesanan'"
                  class="full-width q-mt-lg q-py-md"
                  unelevated
                  :loading="loading"
                  :disable="!agreedToTerms || loading"
                />

                <q-banner v-if="error" class="bg-red-1 text-red-8 q-mt-md rounded-borders">
                  <template v-slot:avatar>
                    <q-icon name="error" color="red-4" />
                  </template>
                  {{ error }}
                </q-banner>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Order Summary (Right Column) -->
        <div class="col-12 col-lg-4">
          <q-card class="shadow-2 rounded-borders q-pa-lg">
            <q-card-section>
              <div class="text-h5 text-weight-semibold q-mb-md">Ringkasan Pesanan</div>
              <q-list separator>
                <q-item v-for="item in cartStore.items" :key="item.product._id">
                  <q-item-section>
                    <q-item-label>{{ item.product.name }} x{{ item.quantity }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label>Rp {{ formatCurrency(item.product.price * item.quantity) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-separator class="q-my-md" />
              <div class="row justify-between q-mb-sm">
                <span class="text-body1 text-grey-8">Subtotal Barang</span>
                <span class="text-body1 text-weight-medium text-grey-9">Rp {{ formatCurrency(cartStore.cartSubtotal) }}</span>
              </div>
              <div class="row justify-between q-mb-sm">
                <span class="text-body1 text-grey-8">Pajak ({{ (taxRate * 100) }}%)</span>
                <span class="text-body1 text-weight-medium text-grey-9">Rp {{ formatCurrency(taxPrice) }}</span>
              </div>
              <div class="row justify-between q-mb-md">
                <span class="text-body1 text-grey-8">Ongkir</span>
                <span class="text-body1 text-weight-medium text-grey-9">Rp {{ formatCurrency(shippingPrice) }}</span>
              </div>
              <q-separator class="q-my-md" />
              <div class="row justify-between text-h5 text-weight-bold text-blue-8 q-mt-md">
                <span>Total Pembayaran</span>
                <span>Rp {{ formatCurrency(totalPrice) }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from 'src/stores/cart'; // Pastikan path ini benar
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

// Pastikan file src/url/index.js Anda mengekspor BE_PRE_URL sebagai default export.
import BE_PRE_URL from 'src/url/index.js';

const router = useRouter();
const cartStore = useCartStore();
const $q = useQuasar(); // Inisialisasi Quasar instance

const shippingAddress = ref({ address: '', city: '', postalCode: '', country: 'Indonesia' });
const paymentMethod = ref('Transfer Bank'); // Default value
const agreedToTerms = ref(false);
const loading = ref(false);
const error = ref(null);

const shippingPrice = ref(10000);
const taxRate = ref(0.10);

const isCheckingLogin = ref(true);
const userInfo = ref(null);

const itemsPrice = computed(() => cartStore.cartSubtotal);
const taxPrice = computed(() => itemsPrice.value * taxRate.value);
const totalPrice = computed(() => itemsPrice.value + shippingPrice.value + taxPrice.value);

const goBackToCart = () => router.push('/cart');

function getUserFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = localStorage.getItem('jwt');
  console.log('[CheckoutView] Getting user from local storage:');
  console.log('    userData:', user ? JSON.parse(user) : 'Not found');
  console.log('    jwt token:', token ? 'Found (length: ' + token.length + ')' : 'Not found');

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
    $q.notify({
      type: 'negative',
      message: 'Anda harus login untuk melakukan pembelian.',
      position: 'top',
      timeout: 3000
    });
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  userInfo.value = storedUser;
  console.log('[CheckoutView] User is logged in. User ID:', userInfo.value._id);

  cartStore.loadCartFromLocalStorage();
  console.log('[CheckoutView] Cart loaded. Items in cart:', cartStore.items.length);

  if (cartStore.items.length === 0) {
    console.warn('[CheckoutView] Cart is empty. Redirecting to products page.');
    $q.notify({
      type: 'warning',
      message: 'Keranjang belanja Anda kosong, silakan tambahkan produk.',
      position: 'top',
      timeout: 3000
    });
    router.push('/home'); // Mengarahkan ke /home (Produk Pipa)
    return;
  }

  isCheckingLogin.value = false;
  console.log('[CheckoutView] Checkout page ready.');
});

const submitOrder = async () => {
  console.log('[CheckoutView] Submitting order...');
  console.log('    Current userInfo:', userInfo.value);
  console.log('    Token for Authorization:', userInfo.value?.token ? 'Exists' : 'MISSING/NULL');
  console.log('    Shipping Address:', shippingAddress.value);
  console.log('    Payment Method:', paymentMethod.value);
  console.log('    Agreed to Terms:', agreedToTerms.value);
  console.log('    Cart Items Count:', cartStore.items.length);

  if (!userInfo.value || !userInfo.value.token) {
    error.value = 'Anda belum login atau sesi Anda telah berakhir. Silakan login kembali.';
    console.error('[CheckoutView] Submit aborted: User not logged in or token missing.');
    $q.notify({
      type: 'negative',
      message: error.value,
      position: 'top',
      timeout: 3000
    });
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    return;
  }

  // Validasi form Quasar akan menangani ini secara otomatis dengan lazy-rules dan rules
  // Namun, kita bisa menambahkan notifikasi Quasar jika error terjadi secara manual
  if (!shippingAddress.value.address || !shippingAddress.value.city || !shippingAddress.value.postalCode || !shippingAddress.value.country) {
    error.value = 'Mohon lengkapi semua informasi pengiriman.';
    $q.notify({
      type: 'warning',
      message: error.value,
      position: 'top',
      timeout: 2000
    });
    return;
  }

  if (!paymentMethod.value) {
    error.value = 'Mohon pilih metode pembayaran.';
    $q.notify({
      type: 'warning',
      message: error.value,
      position: 'top',
      timeout: 2000
    });
    return;
  }

  if (!agreedToTerms.value) {
    error.value = 'Anda harus menyetujui syarat & ketentuan.';
    $q.notify({
      type: 'warning',
      message: error.value,
      position: 'top',
      timeout: 2000
    });
    return;
  }

  if (cartStore.items.length === 0) {
    error.value = 'Keranjang belanja Anda kosong.';
    $q.notify({
      type: 'warning',
      message: error.value,
      position: 'top',
      timeout: 2000
    });
    return;
  }

  loading.value = true;
  error.value = null;
  console.log('[CheckoutView] All frontend validations passed. Preparing for API call.');

  try {
    const orderData = {
      shippingAddress: shippingAddress.value,
      paymentMethod: paymentMethod.value,
      itemsPrice: itemsPrice.value,
      shippingPrice: shippingPrice.value,
      taxPrice: taxPrice.value,
      totalPrice: totalPrice.value,
      orderItems: cartStore.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.imageUrl || '', // Pastikan menggunakan imageUrl dari produk
      })),
    };

    console.log('[CheckoutView] Sending order data as JSON:', orderData);

    console.log(`[CheckoutView] Sending POST request to: http://${BE_PRE_URL}/orders`);
    const { data } = await axios.post(
      `http://${BE_PRE_URL}/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${userInfo.value.token}`
        }
      }
    );

    console.log('[CheckoutView] Order successfully created:', data);
    cartStore.clearCart();
    $q.notify({
      type: 'positive',
      message: 'Pesanan berhasil dibuat! Silakan cek email Anda untuk instruksi pembayaran dan link unggah bukti transfer.',
      position: 'top',
      timeout: 5000
    });
    // FIX: Mengubah `query` menjadi `params` sesuai definisi rute di `routes.js`
    router.push({ name: 'orderConfirmation', params: { orderId: data._id } });
    // window.location.reload(); // Opsional, jika Anda ingin reload penuh
  } catch (err) {
    console.error('[CheckoutView] Gagal submit pesanan:', err);
    let errorMessage = 'Terjadi kesalahan tidak terduga saat membuat pesanan.';
    if (err.response) {
      console.error('[CheckoutView] Server Response Error:', err.response.data);
      console.error('[CheckoutView] Status:', err.response.status);
      errorMessage = err.response.data.message || errorMessage;
    } else if (err.request) {
      console.error('[CheckoutView] Network Error (No response from server):', err.request);
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } else {
      console.error('[CheckoutView] Axios Error (Request setup issue):', err.message);
      errorMessage = err.message || errorMessage;
    }
    error.value = errorMessage;
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000
    });
  } finally {
    loading.value = false;
    console.log('[CheckoutView] Order submission process finished.');
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};
</script>

<style scoped>
/* Custom CSS jika diperlukan, sebagian besar styling ditangani oleh Quasar */
</style>
