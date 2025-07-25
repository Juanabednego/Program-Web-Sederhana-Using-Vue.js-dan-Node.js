<!-- src/pages/Pemesanan.vue -->
<template>
  <!-- Menggunakan q-page sebagai pembungkus utama untuk halaman -->
  <q-page class="q-pa-md bg-grey-2">
    <!-- Kontainer utama dengan padding dan lebar maksimum -->
    <div class="q-mx-auto q-pa-md" style="max-width: 1200px;">
      <!-- Header -->
      <div class="q-mb-lg">
        <div class="text-h4 text-weight-bold text-grey-9 q-mb-sm">Riwayat Pemesanan</div>
        <div class="text-subtitle1 text-grey-7">Kelola dan lacak semua pesanan Anda</div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" />
        <span class="q-ml-md text-grey-7">Memuat pesanan...</span>
      </div>

      <!-- Error State -->
      <q-banner v-if="error && !loading" class="bg-red-1 text-red-8 q-mb-lg rounded-borders">
        <template v-slot:avatar>
          <q-icon name="error" color="red-4" />
        </template>
        <div class="text-body1">{{ error }}</div>
      </q-banner>

      <!-- Empty State -->
      <div v-if="!loading && !error && orders.length === 0" class="text-center q-py-xl">
        <!-- Menggunakan q-icon untuk ikon, atau tetap dengan SVG inline jika unik -->
        <q-icon name="inbox" size="xl" color="grey-4" class="q-mb-md" />
        <div class="text-h6 text-weight-medium text-grey-9 q-mb-xs">Belum ada pesanan</div>
        <div class="text-body1 text-grey-6">Anda belum memiliki pesanan apapun</div>
      </div>

      <!-- Orders List -->
      <div v-if="!loading && !error && orders.length > 0" class="q-gutter-md">
        <q-card v-for="order in orders" :key="order._id" class="shadow-2 rounded-borders overflow-hidden">
          <!-- Order Header -->
          <q-card-section class="bg-grey-1 q-py-md q-px-lg">
            <div class="row justify-between items-start q-col-gutter-md">
              <div class="col-auto">
                <div class="row items-center q-gutter-x-md">
                  <div class="text-h6 text-weight-semibold text-grey-9">Order #{{ order._id.slice(-8) }}</div>
                  <q-badge :color="getStatusBadgeColor(order.orderStatus)" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                    {{ order.orderStatus }}
                  </q-badge>
                </div>
                <div class="text-body2 text-grey-6 q-mt-xs">
                  Dipesan pada: {{ formatDate(order.createdAt) }}
                </div>
              </div>
              <div class="col-auto text-right">
                <div class="text-h6 text-weight-semibold text-grey-9">
                  Rp {{ formatCurrency(order.totalPrice) }}
                </div>
                <div class="text-body2 text-grey-6">{{ order.orderItems.length }} item</div>
              </div>
            </div>
          </q-card-section>

          <!-- Order Items -->
          <q-card-section class="q-py-md q-px-lg">
            <q-list separator>
              <q-item v-for="item in order.orderItems" :key="item._id" class="q-py-sm">
                <q-item-section avatar>
                  <q-img
                    :src="item.image ? `http://localhost:9001/uploads/${item.image}` : 'https://placehold.co/64x64/E0E0E0/616161?text=No+Image'"
                    :alt="item.name"
                    class="rounded-borders"
                    style="height: 64px; width: 64px; object-fit: cover;"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body1 text-weight-medium text-grey-9">{{ item.name }}</q-item-label>
                  <q-item-label caption class="text-body2 text-grey-6">Jumlah: {{ item.quantity }} meter</q-item-label>
                  <q-item-label class="text-body2 text-weight-medium text-grey-9">Rp {{ formatCurrency(item.price) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- Shipping Info -->
          <q-card-section class="bg-grey-1 q-py-md q-px-lg border-t-grey-3">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="text-subtitle1 text-weight-medium text-grey-9 q-mb-sm">Alamat Pengiriman</div>
                <div class="text-body2 text-grey-7">
                  {{ order.shippingAddress.address }}<br>
                  {{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}<br>
                  {{ order.shippingAddress.country }}
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle1 text-weight-medium text-grey-9 q-mb-sm">Metode Pembayaran</div>
                <div class="text-body2 text-grey-7">{{ order.paymentMethod }}</div>
              </div>
            </div>
          </q-card-section>

          <!-- Actions -->
          <q-card-actions align="right" class="q-py-md q-px-lg border-t-grey-3">
            <q-btn
              v-if="canCancelOrder(order.orderStatus)"
              @click="cancelOrder(order._id)"
              :loading="cancellingOrderId === order._id"
              :disable="cancellingOrderId === order._id"
              color="negative"
              label="Batalkan Pesanan"
              class="q-px-md q-py-sm"
            >
              <template v-slot:loading>
                <q-spinner-dots size="1.5em" />
              </template>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js'; // Menggunakan path alias 'src/'

// Inisialisasi Quasar instance
const $q = useQuasar();

// Reactive data
const orders = ref([]);
const loading = ref(false);
const error = ref(null);
const cancellingOrderId = ref(null);

// Helper function untuk mendapatkan token dari localStorage
const getTokenFromLocalStorage = () => {
  try {
    const token = localStorage.getItem('jwt') || localStorage.getItem('token');
    return token;
  } catch (err) {
    console.error('[Pemesanan] Error getting token from localStorage:', err);
    return null;
  }
};

// Fetch orders dari backend
const fetchOrders = async () => {
  console.log('[Pemesanan] Starting to fetch user orders...');
  loading.value = true;
  error.value = null;

  try {
    const user_id = localStorage.getItem('user_id');
    const token = getTokenFromLocalStorage();

    if (!user_id) {
      console.error('[Pemesanan] No user_id found in localStorage');
      throw new Error('User ID tidak ditemukan. Silakan login kembali.');
    }

    if (!token) {
      console.error('[Pemesanan] No token found in localStorage');
      throw new Error('Token autentikasi tidak ditemukan. Silakan login kembali.');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const url = `http://${BE_PRE_URL}/orders/user/${user_id}`;
    console.log(`[Pemesanan] Sending GET request to: ${url}`);

    const { data } = await axios.get(url, config);
    orders.value = data.data;
    console.log('[Pemesanan] Orders fetched successfully:', data);

  } catch (err) {
    console.error('[Pemesanan] Error fetching orders:', err);

    if (err.response) {
      console.error('[Pemesanan] Server Response Error:', err.response.data);
      console.error('[Pemesanan] Status:', err.response.status);
      error.value = err.response.data.message || 'Terjadi kesalahan saat mengambil data pesanan dari server.';

      if (err.response.status === 401) {
        // Mengganti alert() dengan $q.notify()
        $q.notify({
          type: 'negative',
          message: 'Sesi Anda telah berakhir. Harap login kembali.',
          position: 'top',
          timeout: 3000
        });
        localStorage.removeItem('user_id');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        // Anda mungkin ingin mengalihkan ke halaman login di sini
        // useRouter().push('/login'); // Jika Anda ingin mengalihkan secara otomatis
      }
    } else if (err.request) {
      console.error('[Pemesanan] Network Error:', err.request);
      error.value = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } else {
      console.error('[Pemesanan] Error:', err.message);
      error.value = err.message || 'Terjadi kesalahan tidak terduga.';
    }
  } finally {
    loading.value = false;
    console.log('[Pemesanan] Fetch process finished.');
  }
};

// Cancel order function
const cancelOrder = async (orderId) => {
  console.log(`[Pemesanan] Attempting to cancel order: ${orderId}`);

  // Mengganti confirm() dengan $q.dialog()
  $q.dialog({
    title: 'Konfirmasi Pembatalan',
    message: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    cancellingOrderId.value = orderId;

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

      const url = `http://${BE_PRE_URL}/orders/${orderId}/cancel-customer`;
      console.log(`[Pemesanan] Sending PUT request to: ${url}`);

      const { data } = await axios.put(url, {}, config);

      console.log('[Pemesanan] Order cancelled successfully:', data);

      // Update local state
      const orderIndex = orders.value.findIndex(order => order._id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex].orderStatus = 'Cancelled';
      }

      // Mengganti alert() dengan $q.notify()
      $q.notify({
        type: 'positive',
        message: 'Pesanan berhasil dibatalkan!',
        position: 'top',
        timeout: 2000
      });

    } catch (err) {
      console.error('[Pemesanan] Error cancelling order:', err);

      let errorMessage = 'Gagal membatalkan pesanan.';

      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Mengganti alert() dengan $q.notify()
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        timeout: 3000
      });
    } finally {
      cancellingOrderId.value = null;
    }
  });
};

// Helper functions
const getStatusBadgeColor = (status) => {
  const statusColors = {
    'Pending Payment': 'yellow-8', // Warna Quasar
    'Processing': 'blue-8',
    'Shipped': 'purple-8',
    'Delivered': 'green-8',
    'Cancelled': 'red-8',
    'Refunded': 'grey-8',
    'Completed': 'green-8',
  };
  return statusColors[status] || 'grey-8'; // Default warna Quasar
};

const canCancelOrder = (status) => {
  return ['Pending Payment', 'Processing'].includes(status);
};

const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

// Component lifecycle
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
/* Anda dapat menambahkan gaya khusus di sini jika diperlukan.
   Sebagian besar styling sekarang ditangani oleh komponen Quasar dan kelas utilitasnya. */

/* Contoh jika Anda ingin garis pemisah pada card-section */
.border-t-grey-3 {
  border-top: 1px solid #e0e0e0; /* Warna grey-3 Quasar */
}
</style>
