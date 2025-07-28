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

            <!-- Bukti Transfer (Hanya tampil jika metode Transfer Bank dan ada gambar) -->
            <div v-if="purchase.paymentMethod === 'Transfer Bank' && purchase.proofOfTransferImage" class="col-12">
              <p class="text-body2 text-grey-7 q-mb-xs">Bukti Transfer:</p>
              <q-img :src="purchase.proofOfTransferImage" alt="Bukti Transfer"
                     class="rounded-borders shadow-md border-grey-3 cursor-pointer"
                     style="max-width: 250px; height: auto; object-fit: cover;"
                     no-native-menu
                     @click="showProof(purchase.proofOfTransferImage)"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">
                    Gagal memuat gambar
                  </div>
                </template>
              </q-img>
              <p class="text-caption q-mt-xs text-grey-6">Klik gambar untuk melihat ukuran penuh</p>
            </div>
            <div v-else-if="purchase.paymentMethod === 'Transfer Bank' && !purchase.proofOfTransferImage" class="col-12">
              <p class="text-body2 text-grey-7 q-mb-xs">Bukti Transfer:</p>
              <p class="text-body1 text-grey-6 italic">Belum ada bukti transfer diunggah.</p>
            </div>
          </div>
        </q-card-section>

        <!-- Admin Actions Section -->
        <q-card-section v-if="isAdmin" class="q-mt-md bg-indigo-1 rounded-borders border-indigo-3 q-pa-md">
          <div class="text-h6 text-weight-semibold text-blue-8 q-mb-md">Admin Aksi</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="confirmAdminAction('markPaid')"
                v-if="!purchase.isPaid"
                label="Tandai Sudah Dibayar"
                color="green-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="confirmAdminAction('updateStatus', 'Processing')"
                v-if="purchase.orderStatus === 'Pending Payment' || purchase.orderStatus === 'Paid'"
                label="Set ke Processing"
                color="blue-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="confirmAdminAction('updateStatus', 'Shipped')"
                v-if="purchase.orderStatus === 'Processing' && !purchase.isDelivered"
                label="Set ke Dikirim"
                color="purple-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="confirmAdminAction('markDelivered')"
                v-if="purchase.orderStatus === 'Shipped' && !purchase.isDelivered"
                label="Tandai Sudah Dikirim"
                color="teal-7"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="confirmAdminAction('updateStatus', 'Completed')"
                v-if="purchase.isPaid && purchase.isDelivered && purchase.orderStatus !== 'Completed'"
                label="Set ke Selesai"
                color="green-9"
                class="full-width"
                unelevated
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-btn
                @click="confirmAdminAction('updateStatus', 'Cancelled')"
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

    <!-- Dialog untuk menampilkan bukti transfer (ukuran penuh) -->
    <q-dialog v-model="showProofDialog">
      <q-card class="q-dialog-plugin">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Bukti Transfer</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md flex flex-center">
          <q-img
            :src="currentProofImage"
            alt="Bukti Transfer Penuh"
            style="max-width: 90vw; max-height: 80vh; object-fit: contain;"
            class="rounded-borders"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                Gagal memuat gambar bukti transfer.
              </div>
            </template>
          </q-img>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';

import BE_PRE_URL from 'src/url/index.js';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const purchaseId = ref(route.params.id);

const purchase = ref(null);
const loading = ref(true);
const error = ref(null);
const isAdmin = ref(false);

// State untuk dialog bukti transfer
const showProofDialog = ref(false);
const currentProofImage = ref('');

// QTable columns definition for order items
const itemColumns = [
  { name: 'image', label: 'Gambar', align: 'left', field: 'image' }, // Gambar produk
  { name: 'name', required: true, label: 'Nama Produk', align: 'left', field: 'name' },
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
  if (!user || !token) {
    return null;
  }
  try {
    const parsedUser = JSON.parse(user);
    parsedUser.token = token;
    return parsedUser;
  } catch (e) {
    console.error('[PurchaseDetail] Error parsing user data from localStorage:', e);
    return null;
  }
}

const fetchPurchaseDetails = async () => {
  loading.value = true;
  error.value = null;

  try {
    const userInfo = getUserInfoFromLocalStorage();

    if (!userInfo || !userInfo.token) {
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

    isAdmin.value = userInfo.role === 'admin';

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Pastikan endpoint backend mengembalikan proofOfTransferImage
    const { data } = await axios.get(`http://${BE_PRE_URL}/orders/${purchaseId.value}`, config);
    purchase.value = data;
    console.log('[PurchaseDetail] Purchase details fetched successfully:', data);

  } catch (err) {
    console.error('[PurchaseDetail] Error fetching purchase:', err);

    let errorMessage = 'Terjadi kesalahan saat mengambil detail pesanan dari server.';

    if (err.response) {
      errorMessage = err.response.data.message || errorMessage;
      if (err.response.status === 401) {
        $q.notify({ type: 'negative', message: 'Sesi Anda telah berakhir. Harap login kembali.', position: 'top', timeout: 3000 });
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        localStorage.removeItem('token');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      } else if (err.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.';
      } else if (err.response.status === 403) {
        errorMessage = 'Tidak Diotorisasi: Anda tidak memiliki izin untuk melihat pesanan ini.';
        router.push({ name: 'Home' });
      }
    } else if (err.request) {
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
    } else {
      errorMessage = err.message || 'Terjadi kesalahan tidak terduga.';
    }
    error.value = errorMessage;
    purchase.value = null;
  } finally {
    loading.value = false;
  }
};

// Fungsi untuk menampilkan dialog bukti transfer
const showProof = (imageUrl) => {
  currentProofImage.value = imageUrl;
  showProofDialog.value = true;
};

// Fungsi konfirmasi aksi admin dengan pengecekan bukti transfer
const confirmAdminAction = (actionType, newStatus = null) => {
  let title = '';
  let message = '';
  let actionFunction;

  switch (actionType) {
    case 'markPaid':
      title = 'Konfirmasi Pembayaran';
      message = 'Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dibayar?';
      actionFunction = markOrderAsPaid;
      break;
    case 'markDelivered':
      title = 'Konfirmasi Pengiriman';
      message = 'Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dikirim?';
      actionFunction = markOrderAsDelivered;
      break;
    case 'updateStatus':
      title = `Konfirmasi Perubahan Status ke ${newStatus}`;
      message = `Apakah Anda yakin ingin mengubah status pesanan ini menjadi "${newStatus}"?`;
      actionFunction = updateOrderStatus;
      break;
    default:
      return; // Jangan lakukan apa-apa jika actionType tidak dikenal
  }

  let dialogContent = `<p>${message}</p>`;
  const hasProof = purchase.value.paymentMethod === 'Transfer Bank' && purchase.value.proofOfTransferImage;

  if (hasProof) {
    dialogContent += `
      <p class="text-caption text-weight-bold q-mt-md">Bukti Transfer:</p>
      <div class="flex flex-center q-mb-md">
        <img src="${purchase.value.proofOfTransferImage}" alt="Bukti Transfer"
             style="max-width: 150px; height: auto; object-fit: contain; border-radius: 8px; cursor: pointer;"
             onclick="window.open('${purchase.value.proofOfTransferImage}', '_blank');" />
      </div>
      <p class="text-caption text-grey-6 text-center">Klik gambar untuk melihat ukuran penuh</p>
    `;
  } else if (purchase.value.paymentMethod === 'Transfer Bank' && !purchase.value.proofOfTransferImage) {
    dialogContent += `<p class="text-caption text-red-7 q-mt-md">Catatan: Pesanan ini menggunakan Transfer Bank, tetapi bukti transfer belum diunggah.</p>`;
  }

  $q.dialog({
    title: title,
    message: dialogContent,
    html: true, // Penting untuk merender HTML di dalam pesan
    cancel: true,
    persistent: true
  }).onOk(() => {
    // Panggil fungsi aksi yang sesuai
    if (actionType === 'updateStatus') {
      actionFunction(purchase.value._id, newStatus);
    } else {
      actionFunction(purchase.value._id);
    }
  });
};


const updateOrderStatus = async (orderId, newStatus) => {
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
};

const markOrderAsPaid = async (orderId) => {
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
};

const markOrderAsDelivered = async (orderId) => {
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
  if (!imagePath) {
    return 'https://placehold.co/64x64/E0E0E0/616161?text=No+Image';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  let baseStaticUrl = '';
  try {
    const url = new URL(`http://${BE_PRE_URL}`);
    baseStaticUrl = url.origin;
  } catch (e) {
    console.error("Error parsing BE_PRE_URL for static assets:", e);
    baseStaticUrl = `http://${BE_PRE_URL.split('/')[0]}`;
  }

  const normalizedImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseStaticUrl}${normalizedImagePath}`;
};

onMounted(() => {
  if (purchaseId.value) {
    fetchPurchaseDetails();
  } else {
    loading.value = false;
    error.value = 'ID Pembelian tidak ditemukan di URL.';
    $q.notify({
      type: 'negative',
      message: 'ID Pembelian tidak ditemukan di URL.',
      position: 'top',
      timeout: 3000
    });
    router.push({ name: 'UserPurchases' });
  }
});
</script>

<style scoped>
.border-b-grey-3 {
  border-bottom: 1px solid #e0e0e0;
}
.border-t-grey-3 {
  border-top: 1px solid #e0e0e0;
}
.border-indigo-3 {
  border: 1px solid #9FA8DA;
}
.hover-underline:hover {
  text-decoration: underline;
}
</style>
