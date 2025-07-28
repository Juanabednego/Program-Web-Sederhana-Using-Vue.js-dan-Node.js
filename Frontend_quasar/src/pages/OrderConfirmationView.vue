<!-- src/pages/OrderConfirmationView.vue -->
<template>
  <!-- q-page sebagai pembungkus utama untuk halaman, dengan utilitas flexbox Quasar -->
  <q-page class="q-pa-md bg-grey-2">
    <!-- Kontainer utama dengan padding dan pemusatan -->
    <div class="q-mx-auto q-pa-md text-center" style="max-width: 900px;">

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
        <div class="text-h6 text-grey-7">Memuat detail pesanan...</div>
      </div>

      <!-- Error State -->
      <q-banner v-else-if="error" class="bg-red-1 text-red-8 q-mb-lg rounded-borders q-mx-auto" style="max-width: 600px;">
        <template v-slot:avatar>
          <q-icon name="error" color="red-4" />
        </template>
        <div class="text-body1 text-weight-bold">Error!</div>
        <div class="text-body2">{{ error }}</div>
        <div class="text-caption q-mt-sm">Pastikan Anda sudah login dan pesanan dengan ID ini ada.</div>
        <template v-slot:action>
          <q-btn flat label="Kembali ke Beranda" to="/home" color="red-8" />
          <q-btn flat label="Coba Login Lagi" @click="redirectToLogin" color="red-8" />
        </template>
      </q-banner>

      <!-- Order Details Display -->
      <div v-else-if="order">
        <div class="text-h3 text-positive text-weight-bold q-mb-md">Pesanan Berhasil Dibuat!</div>
        <p class="text-lg text-grey-7 q-mb-lg">Terima kasih atas pesanan Anda. Detail pesanan Anda:</p>

        <!-- q-card untuk detail pesanan -->
        <q-card class="q-pa-md shadow-lg rounded-borders q-mx-auto text-left">
          <q-card-section>
            <div class="text-h5 text-weight-semibold q-pb-sm q-mb-sm border-b-grey-3">Detail Pesanan #{{ order._id.slice(-8) }}</div>
            <p class="text-body2 q-mb-xs"><strong>Tanggal Pesanan:</strong> {{ formatDate(order.createdAt) }}</p>
            <p class="text-body2 q-mb-xs"><strong>Status Pembayaran:</strong>
              <q-badge :color="order.isPaid ? 'positive' : 'orange-8'" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                {{ order.isPaid ? `Sudah Dibayar ${order.paidAt ? 'pada ' + formatDate(order.paidAt, true) : ''}` : 'Menunggu Verifikasi' }}
              </q-badge>
            </p>
            <p class="text-body2 q-mb-xs"><strong>Status Pesanan:</strong>
              <q-badge :color="getOrderStatusColor(order.orderStatus)" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                {{ order.orderStatus }}
              </q-badge>
            </p>
            <p class="text-body2 q-mb-xs"><strong>Status Pengiriman:</strong>
              <q-badge :color="order.isDelivered ? 'positive' : 'orange-8'" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                {{ order.isDelivered ? `Sudah Dikirim ${order.deliveredAt ? 'pada ' + formatDate(order.deliveredAt, true) : ''}` : 'Belum Dikirim' }}
              </q-badge>
            </p>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <div class="text-h6 text-weight-semibold q-pb-sm q-mb-sm border-b-grey-3">Alamat Pengiriman</div>
            <p class="text-body2 text-grey-7">{{ order.shippingAddress.address }}</p>
            <p class="text-body2 text-grey-7">{{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}</p>
            <p class="text-body2 text-grey-7">{{ order.shippingAddress.country }}</p>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <div class="text-h6 text-weight-semibold q-pb-sm q-mb-sm border-b-grey-3">Metode Pembayaran</div>
            <p class="text-body2 text-grey-7">{{ order.paymentMethod }}</p>
            <div v-if="order.proofOfTransfer" class="q-mt-md">
                <p class="text-body2 text-weight-semibold text-grey-8 q-mb-sm">Bukti Transfer / Pembayaran:</p>
                <a :href="getImageUrl(order.proofOfTransfer)" target="_blank" class="text-blue-8 hover-underline">
                    <q-img :src="getImageUrl(order.proofOfTransfer)" alt="Bukti Pembayaran"
                           class="rounded-borders shadow-1"
                           style="max-width: 250px; height: auto; object-fit: cover;"
                           no-native-menu
                    >
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-negative text-white">
                          Gagal memuat gambar
                        </div>
                      </template>
                    </q-img>
                    <p class="text-caption q-mt-xs">Klik untuk melihat gambar penuh</p>
                </a>
                <p class="text-caption q-mt-sm text-grey-7 italic">Pembayaran Anda sedang dalam proses verifikasi.</p>
            </div>
            <div v-else class="q-mt-md text-grey-7 italic">
                Tidak ada bukti pembayaran terunggah untuk metode ini.
            </div>
          </q-card-section>

          <q-separator inset />

          <q-card-section>
            <div class="text-h6 text-weight-semibold q-pb-sm q-mb-sm border-b-grey-3">Item Pesanan</div>
            <q-list separator>
              <q-item v-for="item in order.orderItems" :key="item.product" class="q-py-sm">
                <q-item-section avatar>
                  <q-img :src="item.image ? item.image : 'https://placehold.co/64x64/E0E0E0/616161?text=No+Image'"
                         :alt="item.name"
                         class="rounded-borders"
                         style="height: 64px; width: 64px; object-fit: cover;"
                         no-native-menu
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-negative text-white">
                        Gagal memuat gambar
                      </div>
                    </template>
                  </q-img>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body1 text-weight-medium text-grey-9">{{ item.name }}</q-item-label>
                  <q-item-label caption class="text-body2 text-grey-6">Jumlah: {{ item.quantity }} x Rp {{ formatCurrency(item.price) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label class="text-body1 text-weight-bold text-grey-9">Rp {{ formatCurrency(item.quantity * item.price) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator inset />

          <q-card-section class="q-mt-sm q-pt-md q-pb-sm border-t-grey-3">
            <div class="row justify-between items-center text-body1 q-mb-xs">
              <span>Subtotal Barang:</span>
              <span class="text-weight-bold">Rp {{ formatCurrency(order.itemsPrice) }}</span>
            </div>
            <div class="row justify-between items-center text-body1 q-mb-xs">
              <span>Ongkos Kirim:</span>
              <span class="text-weight-bold">Rp {{ formatCurrency(order.shippingPrice) }}</span>
            </div>
            <div class="row justify-between items-center text-body1 q-mb-md">
              <span>Pajak:</span>
              <span class="text-weight-bold">Rp {{ formatCurrency(order.taxPrice) }}</span>
            </div>
            <q-separator spaced="sm" />
            <div class="row justify-between items-center text-h5 text-weight-bold text-blue-8 q-mt-md">
              <span>Total Pembayaran:</span>
              <span>Rp {{ formatCurrency(order.totalPrice) }}</span>
            </div>
          </q-card-section>

          <!-- Cancel Order Section -->
          <q-card-section v-if="canCancelOrder(order.orderStatus)" class="q-mt-sm q-pt-md q-pb-sm border-t-grey-3">
            <q-banner class="bg-yellow-1 text-yellow-8 rounded-borders q-pa-md">
              <template v-slot:avatar>
                <q-icon name="warning" color="yellow-7" />
              </template>
              <div class="text-body1 text-weight-semibold q-mb-sm">Batalkan Pesanan</div>
              <div class="text-body2 text-yellow-7 q-mb-md">
                Anda masih dapat membatalkan pesanan ini karena statusnya adalah "{{ order.orderStatus }}".
                Setelah dibatalkan, pesanan tidak dapat dikembalikan.
              </div>
              <template v-slot:action>
                <q-btn
                  @click="cancelOrder"
                  :loading="cancellingOrder"
                  :disable="cancellingOrder"
                  color="negative"
                  label="Batalkan Pesanan"
                  class="q-px-md q-py-sm"
                >
                  <template v-slot:loading>
                    <q-spinner-dots size="1.5em" />
                  </template>
                </q-btn>
              </template>
            </q-banner>
          </q-card-section>

          <!-- Order Cancelled Message -->
          <q-card-section v-else-if="order.orderStatus === 'Cancelled'" class="q-mt-sm q-pt-md q-pb-sm border-t-grey-3">
            <q-banner class="bg-red-1 text-red-8 rounded-borders q-pa-md">
              <template v-slot:avatar>
                <q-icon name="cancel" color="red-7" />
              </template>
              <div class="text-body1 text-weight-semibold q-mb-sm">Pesanan Dibatalkan</div>
              <div class="text-body2 text-red-7">
                Pesanan ini telah dibatalkan dan tidak dapat diproses lebih lanjut.
              </div>
            </q-banner>
          </q-card-section>

          <!-- Order Cannot be Cancelled Message -->
          <q-card-section v-else class="q-mt-sm q-pt-md q-pb-sm border-t-grey-3">
            <q-banner class="bg-blue-1 text-blue-8 rounded-borders q-pa-md">
              <template v-slot:avatar>
                <q-icon name="info" color="blue-7" />
              </template>
              <div class="text-body1 text-weight-semibold q-mb-sm">Status Pesanan</div>
              <div class="text-body2 text-blue-7">
                Pesanan dengan status "{{ order.orderStatus }}" tidak dapat dibatalkan.
              </div>
            </q-banner>
          </q-card-section>
        </q-card>

        <!-- Tombol navigasi di bagian bawah -->
        <div class="q-mt-lg flex flex-center q-gutter-md">
          <q-btn
            color="primary"
            label="Kembali ke Beranda"
            to="/home"
            size="lg"
            unelevated
            class="q-px-lg q-py-md"
          />
          <q-btn
            color="grey-7"
            label="Lihat Semua Pesanan"
            to="/pemesanan"
            size="lg"
            unelevated
            class="q-px-lg q-py-md"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js'; // Menggunakan path alias 'src/'

// Inisialisasi Quasar instance
const $q = useQuasar();

const route = useRoute();
const router = useRouter();
const orderId = ref(null); // Menggunakan ref untuk orderId

const order = ref(null);
const loading = ref(true);
const error = ref(null);
const cancellingOrder = ref(false);

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
  console.log('   userData found:', !!user);
  console.log('   jwt token found:', !!token);

  if (!user || !token) {
    console.warn('[OrderConfirmation] User data or JWT token is missing in localStorage. User needs to login.');
    return null;
  }

  try {
    const parsedUser = JSON.parse(user);
    parsedUser.token = token;
    console.log('[OrderConfirmation] Successfully retrieved user info with token.');
    return parsedUser;
  } catch (e) {
    console.error('[OrderConfirmation] Error parsing user data from localStorage:', e);
    return null;
  }
}

const fetchOrder = async () => {
  console.log(`[OrderConfirmation] Attempting to fetch order with ID: ${orderId.value}`);
  loading.value = true;
  error.value = null;

  try {
    const userInfo = getUserInfoFromLocalStorage();

    if (!userInfo || !userInfo.token) {
      console.error('[OrderConfirmation] No valid user info or token found to fetch order. Redirecting to login.');
      // Tidak perlu throw error di sini, langsung redirect
      $q.notify({
        type: 'negative',
        message: 'Anda harus login untuk melihat detail pesanan ini. Token autentikasi tidak ditemukan.',
        position: 'top',
        timeout: 3000
      });
      router.push({ name: 'Login', query: { redirect: route.fullPath } });
      return; // Penting: keluar dari fungsi setelah redirect
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    console.log(`[OrderConfirmation] Sending GET request to: http://${BE_PRE_URL}/orders/${orderId.value}`);
    // console.log('[OrderConfirmation] Authorization Header:', config.headers.Authorization); // Hindari logging token sensitif di produksi

    const { data } = await axios.get(`http://${BE_PRE_URL}/orders/${orderId.value}`, config);
    order.value = data;
    console.log('[OrderConfirmation] Order data fetched successfully:', order.value); // Log the assigned value

  } catch (err) {
    console.error('[OrderConfirmation] Error fetching order:', err);

    let errorMessage = 'Terjadi kesalahan saat mengambil detail pesanan dari server.';

    if (err.response) {
      console.error('[OrderConfirmation] Server Response Error:', err.response.data);
      console.error('[OrderConfirmation] Status:', err.response.status);
      errorMessage = err.response.data.message || errorMessage;

      if (err.response.status === 401 || err.response.status === 403) {
        $q.notify({
          type: 'negative',
          message: 'Sesi Anda telah berakhir atau Anda tidak memiliki izin. Harap login kembali.',
          position: 'top',
          timeout: 3000
        });
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      } else if (err.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.';
      }
    } else if (err.request) {
      console.error('[OrderConfirmation] Network Error (No response from server):', err.request);
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } else {
      console.error('[OrderConfirmation] Axios Error (Request setup issue):', err.message);
      errorMessage = err.message || errorMessage;
    }
    error.value = errorMessage; // Set error.value di sini
  } finally {
    loading.value = false;
    console.log('[OrderConfirmation] Order fetch process finished.');
  }
};

const cancelOrder = async () => {
  console.log(`[OrderConfirmation] Attempting to cancel order: ${orderId.value}`);

  $q.dialog({
    title: 'Konfirmasi Pembatalan',
    message: 'Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
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

      const url = `http://${BE_PRE_URL}/orders/${orderId.value}/cancel-customer`;
      console.log(`[OrderConfirmation] Sending PUT request to: ${url}`);

      const { data } = await axios.put(url, {}, config);

      console.log('[OrderConfirmation] Order cancelled successfully:', data);

      order.value.orderStatus = data.order.orderStatus; // Update status pesanan di UI

      $q.notify({
        type: 'positive',
        message: 'Pesanan berhasil dibatalkan!',
        position: 'top',
        timeout: 2000
      });

    } catch (err) {
      console.error('[OrderConfirmation] Error cancelling order:', err);

      let errorMessage = 'Gagal membatalkan pesanan.';

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        timeout: 3000
      });
    } finally {
      cancellingOrder.value = false;
    }
  });
};

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

// Fungsi formatCurrency yang menyebabkan error
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Menambahkan formatPrice juga untuk konsistensi, meskipun fungsinya sama
const formatPrice = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};


const getImageUrl = (imagePath) => {
  // Pastikan BE_PRE_URL tidak memiliki trailing slash
  const baseUrl = `http://${BE_PRE_URL}`;
  console.log('[OrderConfirmation] Generating image URL for:', imagePath, 'Base URL used:', baseUrl);

  // Jika imagePath sudah merupakan URL lengkap, gunakan langsung
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }

  // Jika imagePath adalah path relatif, gabungkan dengan base URL backend
  const finalImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${finalImagePath}`;
};

// Helper function untuk mendapatkan warna badge status
const getOrderStatusColor = (status) => {
  switch (status) {
    case 'Pending Payment': return 'yellow-8';
    case 'Processing': return 'blue-8';
    case 'Shipped': return 'purple-8';
    case 'Delivered': return 'green-8';
    case 'Completed': return 'green-8';
    case 'Cancelled': return 'red-8';
    case 'Refunded': return 'grey-8';
    default: return 'grey-8';
  }
};

const redirectToLogin = () => {
  router.push({ name: 'Login', query: { redirect: route.fullPath } });
};

onMounted(() => {
  // Mengambil orderId dari route.params
  orderId.value = route.params.orderId;
  console.log('[OrderConfirmation] Component mounted. Order ID from route:', orderId.value);
  if (orderId.value) {
    fetchOrder();
  } else {
    error.value = 'ID Pesanan tidak ditemukan di URL.';
    loading.value = false;
    console.error('[OrderConfirmation] No orderId found in URL parameters. Cannot fetch order.');
  }
});
</script>

<style scoped>
/* Custom CSS for borders if Quasar's q-separator is not enough */
.border-b-grey-3 {
  border-bottom: 1px solid #e0e0e0; /* Quasar's grey-3 */
}
.border-t-grey-3 {
  border-top: 1px solid #e0e0e0; /* Quasar's grey-3 */
}
.hover-underline:hover {
  text-decoration: underline;
}
</style>
