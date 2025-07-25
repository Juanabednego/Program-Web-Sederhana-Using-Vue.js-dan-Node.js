<!-- src/pages/PurchaseDetail.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="q-mx-auto q-px-md q-py-lg" style="max-width: 900px;">
      <div class="flex items-center q-mb-lg">
        <q-btn
          @click="router.back()"
          color="grey-7"
          text-color="dark"
          icon="arrow_back"
          label="Kembali"
          unelevated
          class="q-mr-md q-px-md q-py-sm"
        />
        <div class="text-h4 text-weight-bold text-grey-9">Detail Pembelian (ID: {{ purchaseId.slice(-8) }})</div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
        <div class="text-h6 text-grey-7">Memuat detail pembelian...</div>
      </div>

      <!-- Error State -->
      <q-banner v-else-if="!purchase" class="bg-red-1 text-red-8 q-mb-lg rounded-borders q-mx-auto" style="max-width: 600px;">
        <template v-slot:avatar>
          <q-icon name="error" color="red-4" />
        </template>
        <div class="text-body1 text-weight-bold">Error!</div>
        <div class="text-body2">{{ error || 'Gagal memuat detail pembelian atau pembelian tidak ditemukan.' }}</div>
        <div class="text-caption q-mt-sm">Pastikan Anda sudah login dan pesanan dengan ID ini ada.</div>
      </q-banner>

      <!-- Purchase Details Display -->
      <q-card v-else class="shadow-lg rounded-borders q-pa-lg">
        <q-card-section>
          <div class="text-h5 text-weight-semibold text-grey-9 q-pb-sm q-mb-md border-b-grey-3">Informasi Pembelian</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">ID Pembelian:</p>
              <p class="text-body1 text-grey-9 text-weight-medium">{{ purchase._id }}</p>
            </div>
            <div class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Tanggal Pesanan:</p>
              <p class="text-body1 text-grey-9 text-weight-medium">{{ formatDate(purchase.createdAt) }}</p>
            </div>
            <div class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Status Pesanan:</p>
              <q-badge :color="getOrderStatusColor(purchase.orderStatus)" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                {{ purchase.orderStatus }}
              </q-badge>
            </div>
            <div class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Jumlah Total:</p>
              <p class="text-h6 text-positive text-weight-bold">{{ formatCurrency(purchase.totalPrice) }}</p>
            </div>
            <div v-if="purchase.paymentMethod" class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Metode Pembayaran:</p>
              <p class="text-body1 text-grey-9 text-weight-medium">{{ purchase.paymentMethod }}</p>
            </div>
            <div v-if="purchase.isPaid !== undefined" class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Status Pembayaran:</p>
              <q-badge :color="purchase.isPaid ? 'positive' : 'orange-8'" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                {{ purchase.isPaid ? `Sudah Dibayar ${purchase.paidAt ? 'pada ' + formatDate(purchase.paidAt, true) : ''}` : 'Belum Dibayar' }}
              </q-badge>
            </div>
            <div v-if="purchase.isDelivered !== undefined" class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Status Pengiriman:</p>
              <q-badge :color="purchase.isDelivered ? 'positive' : 'orange-8'" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                {{ purchase.isDelivered ? `Sudah Dikirim ${purchase.deliveredAt ? 'pada ' + formatDate(purchase.deliveredAt, true) : ''}` : 'Belum Dikirim' }}
              </q-badge>
            </div>
            <div v-if="purchase.proofOfTransfer" class="col-12">
              <p class="text-body2 text-grey-7 q-mb-xs">Bukti Transfer:</p>
              <a :href="getImageUrl(purchase.proofOfTransfer)" target="_blank" class="text-blue-8 hover-underline">
                <q-img :src="getImageUrl(purchase.proofOfTransfer)" alt="Bukti Transfer"
                       class="rounded-borders shadow-md border-grey-3"
                       style="max-width: 200px; height: auto; object-fit: cover;"
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
            </div>
          </div>
        </q-card-section>

        <!-- Admin Actions Section -->
        <q-card-section v-if="isAdmin" class="q-mt-md bg-indigo-1 rounded-borders border-indigo-3 q-pa-md">
          <div class="text-h6 text-weight-semibold text-blue-8 q-mb-md">Admin Aksi</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="markOrderAsPaid(purchase._id)"
                v-if="!purchase.isPaid"
                label="Tandai Sudah Dibayar"
                color="green-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="updateOrderStatus(purchase._id, 'Processing')"
                v-if="purchase.orderStatus === 'Pending Payment' || purchase.orderStatus === 'Paid'"
                label="Set ke Processing"
                color="blue-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="updateOrderStatus(purchase._id, 'Shipped')"
                v-if="purchase.orderStatus === 'Processing' && !purchase.isDelivered"
                label="Set ke Dikirim"
                color="purple-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="markOrderAsDelivered(purchase._id)"
                v-if="purchase.orderStatus === 'Shipped' && !purchase.isDelivered"
                label="Tandai Sudah Dikirim"
                color="teal-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="updateOrderStatus(purchase._id, 'Completed')"
                v-if="purchase.isPaid && purchase.isDelivered && purchase.orderStatus !== 'Completed'"
                label="Set ke Selesai"
                color="green-9"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="updateOrderStatus(purchase._id, 'Cancelled')"
                v-if="purchase.orderStatus !== 'Cancelled' && purchase.orderStatus !== 'Completed'"
                label="Batalkan Pesanan"
                color="red-7"
                class="full-width"
                unelevated
              />
            </div>
          </div>
        </q-card-section>

        <q-separator inset class="q-my-lg" />

        <q-card-section>
          <div class="text-h5 text-weight-semibold text-grey-9 q-pb-sm q-mb-md border-b-grey-3">Informasi Pembeli</div>
          <div v-if="purchase.user" class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Nama Pembeli:</p>
              <p class="text-body1 text-grey-9 text-weight-medium">{{ purchase.user.nama }}</p>
            </div>
            <div class="col-12 col-md-6">
              <p class="text-body2 text-grey-7 q-mb-xs">Email Pembeli:</p>
              <p class="text-body1 text-grey-9 text-weight-medium">{{ purchase.user.email }}</p>
            </div>
            <div class="col-12">
              <p class="text-body2 text-grey-7 q-mb-xs">Alamat Pengiriman:</p>
              <p class="text-body1 text-grey-9 text-weight-medium">
                {{ purchase.shippingAddress?.address }}, {{ purchase.shippingAddress?.city }},
                {{ purchase.shippingAddress?.postalCode }}, {{ purchase.shippingAddress?.country }}
              </p>
            </div>
          </div>
          <p v-else class="text-grey-7 italic">Informasi pembeli tidak tersedia.</p>
        </q-card-section>

        <q-separator inset class="q-my-lg" />

        <q-card-section>
          <div class="text-h5 text-weight-semibold text-grey-9 q-pb-sm q-mb-md border-b-grey-3">Item-item Pembelian</div>
          <div v-if="purchase.orderItems && purchase.orderItems.length > 0">
            <q-table
              :rows="purchase.orderItems"
              :columns="itemColumns"
              row-key="product"
              hide-bottom
              flat
            >
              <template v-slot:body-cell-image="props">
                <q-td :props="props">
                  <q-img v-if="props.row.image" :src="getImageUrl(props.row.image)" :alt="props.row.name"
                         class="rounded"
                         style="width: 48px; height: 48px; object-fit: cover;"
                         no-native-menu
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-negative text-white">
                        No Image
                      </div>
                    </template>
                  </q-img>
                  <span v-else class="text-caption text-grey-6">No Image</span>
                </q-td>
              </template>
              <template v-slot:body-cell-price="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.price) }}
                </q-td>
              </template>
              <template v-slot:body-cell-total="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.quantity * props.row.price) }}
                </q-td>
              </template>
            </q-table>
          </div>
          <p v-else class="text-grey-7 italic">Tidak ada item dalam pembelian ini.</p>
        </q-card-section>

        <q-separator inset class="q-my-lg" />

        <q-card-section class="q-mt-md q-pt-md q-pb-sm border-t-grey-3">
          <div class="row justify-between items-center text-body1 q-mb-xs">
            <span>Subtotal Barang:</span>
            <span class="text-weight-bold">Rp {{ formatCurrency(purchase.itemsPrice) }}</span>
          </div>
          <div class="row justify-between items-center text-body1 q-mb-xs">
            <span>Ongkos Kirim:</span>
            <span class="text-weight-bold">Rp {{ formatCurrency(purchase.shippingPrice) }}</span>
          </div>
          <div class="row justify-between items-center text-body1 q-mb-md">
            <span>Pajak:</span>
            <span class="text-weight-bold">Rp {{ formatCurrency(purchase.taxPrice) }}</span>
          </div>
          <q-separator spaced="sm" />
          <div class="row justify-between items-center text-h5 text-weight-bold text-blue-8 q-mt-md">
            <span>Total Pembayaran:</span>
            <span>Rp {{ formatCurrency(purchase.totalPrice) }}</span>
          </div>
        </q-card-section>
      </q-card>
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
const purchaseId = ref(route.params.id); // Menggunakan ref untuk purchaseId

const purchase = ref(null);
const loading = ref(true);
const error = ref(null);
const isAdmin = ref(false); // New state to check if the current user is an admin

// QTable columns definition for order items
const itemColumns = [
  { name: 'name', required: true, label: 'Nama Produk', align: 'left', field: 'name' },
  { name: 'image', label: 'Gambar', align: 'center', field: 'image' },
  { name: 'quantity', label: 'Kuantitas', align: 'center', field: 'quantity' },
  { name: 'price', label: 'Harga Satuan', align: 'right', field: 'price', format: val => formatCurrency(val) },
  { name: 'total', label: 'Total', align: 'right', field: row => row.quantity * row.price, format: val => formatCurrency(val) }
];


const getTokenFromLocalStorage = () => {
  try {
    const token = localStorage.getItem('jwt') || localStorage.getItem('token');
    return token;
  } catch (err) {
    console.error('[PurchaseDetail] Error getting token from localStorage:', err);
    return null;
  }
};

function getUserInfoFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = getTokenFromLocalStorage();
  console.log('[PurchaseDetail] Attempting to get user info from localStorage...');
  console.log('   userData found:', !!user);
  console.log('   jwt token found:', !!token);

  if (!user || !token) {
    console.warn('[PurchaseDetail] User data or JWT token is missing in localStorage.');
    return null;
  }

  try {
    const parsedUser = JSON.parse(user);
    parsedUser.token = token;
    console.log('[PurchaseDetail] Successfully retrieved user info with token. User Role:', parsedUser.role);
    return parsedUser;
  } catch (e) {
    console.error('[PurchaseDetail] Error parsing user data from localStorage:', e);
    return null;
  }
}

const fetchPurchaseDetails = async () => {
  console.log(`[PurchaseDetail] Attempting to fetch purchase with ID: ${purchaseId.value}`);
  loading.value = true;
  error.value = null;

  try {
    const userInfo = getUserInfoFromLocalStorage();

    if (!userInfo || !userInfo.token) {
      console.error('[PurchaseDetail] No valid user info or token found to fetch order.');
      $q.notify({
        type: 'negative',
        message: 'Anda harus login untuk melihat detail pesanan ini. Token autentikasi tidak ditemukan.',
        position: 'top',
        timeout: 3000
      });
      localStorage.removeItem('userData');
      localStorage.removeItem('jwt');
      localStorage.removeItem('token');
      router.push({ name: 'Login', query: { redirect: route.fullPath } });
      return;
    }

    // Check if user is admin
    isAdmin.value = userInfo.role === 'admin';

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    console.log(`[PurchaseDetail] Sending GET request to: http://${BE_PRE_URL}/orders/${purchaseId.value}`);
    console.log('[PurchaseDetail] Authorization Header:', config.headers.Authorization);

    const { data } = await axios.get(`http://${BE_PRE_URL}/orders/${purchaseId.value}`, config);
    purchase.value = data;
    console.log('[PurchaseDetail] Purchase details fetched successfully:', data);

  } catch (err) {
    console.error('[PurchaseDetail] Error fetching purchase:', err);

    let errorMessage = 'Terjadi kesalahan saat mengambil detail pesanan dari server.';

    if (err.response) {
      console.error('[PurchaseDetail] Server Response Error:', err.response.data);
      console.error('[PurchaseDetail] Status:', err.response.status);
      errorMessage = err.response.data.message || errorMessage;

      if (err.response.status === 401) {
        $q.notify({
          type: 'negative',
          message: 'Sesi Anda telah berakhir. Harap login kembali.',
          position: 'top',
          timeout: 3000
        });
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      } else if (err.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.';
      } else if (err.response.status === 403) { // Specific check for forbidden if a regular user tries to access another's order
        errorMessage = 'Tidak Diotorisasi: Anda tidak memiliki izin untuk melihat pesanan ini.';
        router.push({ name: 'Home' }); // Or whatever appropriate redirect
      }
    } else if (err.request) {
      console.error('[PurchaseDetail] Network Error (No response from server):', err.request);
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } else {
      console.error('[PurchaseDetail] Axios Error (Request setup issue):', err.message);
      errorMessage = err.message || 'Terjadi kesalahan tidak terduga.';
    }
    error.value = errorMessage; // Set error.value di sini
    purchase.value = null; // Clear purchase on error
  } finally {
    loading.value = false;
    console.log('[PurchaseDetail] Order fetch process finished.');
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  console.log(`[PurchaseDetail] Attempting to update order ${orderId} status to: ${newStatus}`);

  $q.dialog({
    title: 'Konfirmasi Perubahan Status',
    message: `Apakah Anda yakin ingin mengubah status pesanan ini menjadi "${newStatus}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const userInfo = getUserInfoFromLocalStorage();
      if (!userInfo || !userInfo.token) {
        throw new Error('Anda harus login untuk mengubah status pesanan.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const body = { orderStatus: newStatus };

      console.log(`[PurchaseDetail] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/status with body:`, body);
      await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/status`, body, config);

      $q.notify({
        type: 'positive',
        message: `Status pesanan berhasil diubah menjadi "${newStatus}".`,
        position: 'top',
        timeout: 2000
      });
      fetchPurchaseDetails(); // Muat ulang detail untuk menampilkan perubahan
    } catch (err) {
      console.error('Error updating order status:', err);
      let errorMessage = 'Gagal mengubah status pesanan.';
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
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      }
    }
  });
};

const markOrderAsPaid = async (orderId) => {
  console.log(`[PurchaseDetail] Attempting to mark order ${orderId} as paid.`);

  $q.dialog({
    title: 'Konfirmasi Pembayaran',
    message: `Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dibayar?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const userInfo = getUserInfoFromLocalStorage();
      if (!userInfo || !userInfo.token) {
        throw new Error('Anda harus login untuk mengubah status pembayaran.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      console.log(`[PurchaseDetail] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/pay`);
      await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/pay`, {}, config);

      $q.notify({
        type: 'positive',
        message: `Pesanan berhasil ditandai sebagai sudah dibayar.`,
        position: 'top',
        timeout: 2000
      });
      fetchPurchaseDetails(); // Muat ulang detail untuk menampilkan perubahan
    } catch (err) {
      console.error('Error marking order as paid:', err);
      let errorMessage = 'Gagal menandai pesanan sebagai sudah dibayar.';
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
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      }
    }
  });
};

const markOrderAsDelivered = async (orderId) => {
  console.log(`[PurchaseDetail] Attempting to mark order ${orderId} as delivered.`);

  $q.dialog({
    title: 'Konfirmasi Pengiriman',
    message: `Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dikirim?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const userInfo = getUserInfoFromLocalStorage();
      if (!userInfo || !userInfo.token) {
        throw new Error('Anda harus login untuk mengubah status pengiriman.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      console.log(`[PurchaseDetail] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/deliver`);
      await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/deliver`, {}, config);

      $q.notify({
        type: 'positive',
        message: `Pesanan berhasil ditandai sebagai sudah dikirim.`,
        position: 'top',
        timeout: 2000
      });
      fetchPurchaseDetails(); // Muat ulang detail untuk menampilkan perubahan
    } catch (err) {
      console.error('Error marking order as delivered:', err);
      let errorMessage = 'Gagal menandai pesanan sebagai sudah dikirim.';
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
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      }
    }
  });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Rp ' + (0).toLocaleString('id-ID');
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }
  return date.toLocaleDateString('id-ID', options);
};

// Helper function to get status badge color for Quasar
const getOrderStatusColor = (status) => {
  if (!status) return 'grey-7';
  switch (status.toLowerCase()) {
    case 'pending payment': return 'yellow-8';
    case 'processing':
    case 'paid': return 'blue-8';
    case 'shipped': return 'purple-8';
    case 'completed':
    case 'delivered': return 'green-8';
    case 'cancelled': return 'red-8';
    case 'refunded': return 'grey-8';
    default: return 'grey-7';
  }
};

const getImageUrl = (imagePath) => {
  const baseUrl = `http://${BE_PRE_URL}`; // Assuming BE_PRE_URL is just the domain:port
  console.log('[PurchaseDetail] Generating image URL for:', imagePath, 'Base URL used:', baseUrl);

  // If imagePath is already a full URL, use it directly
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }

  // If imagePath is a relative path, combine with backend base URL
  const finalImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${finalImagePath}`;
};

onMounted(() => {
  console.log('[PurchaseDetail] Component mounted. Purchase ID from route:', purchaseId.value);
  if (purchaseId.value) {
    fetchPurchaseDetails();
  } else {
    loading.value = false;
    error.value = 'ID Pembelian tidak ditemukan di URL.'; // Set error message
    $q.notify({
      type: 'negative',
      message: 'ID Pembelian tidak ditemukan di URL.',
      position: 'top',
      timeout: 3000
    });
    router.push({ name: 'UserPurchases' }); // Redirect back to list if ID is missing
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
.border-indigo-3 {
  border: 1px solid #9FA8DA; /* Quasar's indigo-3 */
}
.hover-underline:hover {
  text-decoration: underline;
}
</style>
