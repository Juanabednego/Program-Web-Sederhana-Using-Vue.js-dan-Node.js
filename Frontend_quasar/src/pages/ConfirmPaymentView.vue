<template>
  <!-- q-page sebagai pembungkus utama untuk halaman, dengan latar belakang abu-abu terang Quasar -->
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <!-- Kontainer utama dengan padding dan lebar maksimum -->
    <q-card class="q-pa-lg shadow-lg rounded-borders" style="width: 100%; max-width: 700px;">
      <q-card-section class="text-center">
        <!-- Menggunakan kelas tipografi Quasar untuk judul -->
        <div class="text-h4 text-weight-bold text-blue-8 q-mb-md">Konfirmasi Pembayaran</div>
      </q-card-section>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center q-py-xl">
        <div class="text-h6 text-grey-7 q-mb-md">Memverifikasi tautan pembayaran Anda...</div>
        <q-spinner-dots color="primary" size="3em" />
      </div>

      <!-- Error State -->
      <q-banner v-else-if="error" class="bg-red-1 text-red-8 q-mb-lg rounded-borders text-center q-mx-auto">
        <template v-slot:avatar>
          <q-icon name="error" color="red-4" />
        </template>
        <div class="text-h6 text-weight-semibold">{{ error }}</div>
        <div class="text-body2 q-mt-sm">Silakan periksa kembali tautan yang Anda terima di email atau hubungi kami.</div>
        <template v-slot:action>
          <q-btn
            color="primary"
            label="Kembali ke Halaman Utama"
            to="/"
            unelevated
            class="q-mt-md"
          />
        </template>
      </q-banner>

      <!-- Order Details Display -->
      <div v-else-if="order">
        <q-card-section class="space-y-md">
          <div class="text-h5 text-weight-semibold text-grey-9 q-pb-sm q-mb-sm border-b-grey-3">Detail Pesanan #{{ order._id.slice(-8) }}</div>
          <p class="text-body1 text-grey-8"><strong>Status Pesanan:</strong>
            <q-badge :color="getStatusColor(order.orderStatus)" class="q-ml-sm q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
              {{ order.orderStatus }}
            </q-badge>
          </p>
          <p class="text-body1 text-grey-8"><strong>Metode Pembayaran:</strong> {{ order.paymentMethod }}</p>
          <p class="text-body1 text-grey-8"><strong>Tanggal Pesanan:</strong> {{ formatDate(order.createdAt) }}</p>
          <p class="text-h5 text-weight-bold text-blue-8 q-mt-md">
            Total yang Harus Dibayar: Rp {{ formatPrice(order.totalPrice) }}
          </p>
        </q-card-section>

        <q-separator inset />

        <q-card-section>
          <div class="text-h6 text-weight-semibold text-grey-9 q-pb-sm q-mb-sm border-b-grey-3">Daftar Produk:</div>
          <q-list dense>
            <q-item v-for="item in order.orderItems" :key="item.product">
              <q-item-section>
                <q-item-label>{{ item.name }} ({{ item.quantity }}x)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>Rp {{ formatPrice(item.price * item.quantity) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator inset />

        <!-- Unggah Bukti Transfer Section -->
        <q-card-section v-if="order.orderStatus === 'Pending Payment'" class="q-mt-md bg-blue-1 rounded-borders border-blue-3 q-pa-md">
          <div class="text-h5 text-weight-semibold text-blue-8 q-mb-md text-center">Unggah Bukti Transfer</div>
          <p class="text-body1 text-grey-8 q-mb-md text-center">Mohon unggah bukti transfer Anda untuk melanjutkan pesanan.</p>

          <q-file
            v-model="selectedFile"
            label="Pilih Bukti Transfer (JPG, PNG, GIF, maks 5MB)"
            filled
            counter
            clearable
            accept="image/*"
            max-file-size="5242880"
            @update:model-value="handleFileChange"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <template v-slot:append v-if="selectedFile">
              <q-icon name="close" @click.stop="selectedFile = null; uploadError = null; uploadSuccess = null" class="cursor-pointer" />
            </template>
          </q-file>

          <p v-if="uploadError" class="text-negative text-caption q-mt-sm">{{ uploadError }}</p>
          <p v-if="uploadSuccess" class="text-positive text-caption q-mt-sm">{{ uploadSuccess }}</p>

          <q-btn
            @click="submitProofOfTransfer"
            :loading="isUploading"
            :disable="isUploading || !selectedFile"
            color="primary"
            label="Unggah Bukti Transfer"
            class="full-width q-mt-md"
            unelevated
          >
            <template v-slot:loading>
              <q-spinner-dots size="1.5em" />
            </template>
          </q-btn>

          <div v-if="order.proofOfTransferImage" class="q-mt-md text-center">
            <p class="text-grey-7 text-body2 q-mb-sm">Bukti transfer yang sudah diunggah:</p>
            <q-img :src="getImageUrl(order.proofOfTransferImage)" alt="Bukti Transfer"
                   class="q-mx-auto rounded-borders shadow-md"
                   style="max-width: 250px; height: auto; object-fit: cover;"
                   no-native-menu
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-negative text-white">
                  Gagal memuat gambar
                </div>
              </template>
            </q-img>
          </div>
        </q-card-section>

        <!-- Pesan Status Pembayaran Lainnya -->
        <q-card-section v-else class="q-mt-md bg-green-1 rounded-borders border-green-3 text-center q-pa-md">
          <div class="text-h5 text-weight-semibold text-positive q-mb-sm">Pembayaran Anda sedang diproses atau sudah dikonfirmasi.</div>
          <p class="text-body1 text-grey-7 q-mt-sm">Terima kasih atas konfirmasinya!</p>
          <q-btn
            label="Lihat Pesanan Saya"
            color="primary"
            to="/pemesanan"
            unelevated
            class="q-mt-md"
          />
        </q-card-section>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js';

// Inisialisasi Quasar instance
const $q = useQuasar();
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
    console.log('[ConfirmPaymentView] Order details fetched successfully:', data);
    // Tambahkan log ini untuk melihat status pesanan yang diterima
    console.log('[ConfirmPaymentView] Fetched orderStatus for display:', order.value.orderStatus);
  } catch (err) {
    console.error('[ConfirmPaymentView] Gagal memverifikasi token atau mengambil detail pesanan:', err);
    let errorMessage = 'Terjadi kesalahan saat memverifikasi tautan.';
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    error.value = errorMessage; // Set error.value di sini

    if (err.response && (err.response.status === 400 || err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
      console.log('[ConfirmPaymentView] Redirecting to tokenInvalid due to backend error status.');
      router.push({ name: 'tokenInvalid' });
    }
  } finally {
    isLoading.value = false;
  }
};

const handleFileChange = (file) => {
  // q-file v-model langsung memberikan objek File
  selectedFile.value = file;
  uploadError.value = null;
  uploadSuccess.value = null;

  if (file) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowed.includes(file.type)) {
      uploadError.value = 'Hanya file gambar (JPG, PNG, GIF) yang diizinkan.';
      selectedFile.value = null; // Clear selected file
    } else if (file.size > maxFileSize) {
      uploadError.value = `Ukuran file maksimal 5MB. File Anda ${Math.round(file.size / 1024 / 1024)}MB.`;
      selectedFile.value = null; // Clear selected file
    }
  }
};

const submitProofOfTransfer = async () => {
  if (!selectedFile.value) {
    uploadError.value = 'Mohon pilih file bukti transfer.';
    $q.notify({
      type: 'warning',
      message: 'Mohon pilih file bukti transfer.',
      position: 'top',
      timeout: 2000
    });
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
    // Mengubah axios.put menjadi axios.post
    const { data } = await axios.post(`http://${BE_PRE_URL}/orders/${orderId}/upload-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    uploadSuccess.value = data.message || 'Bukti transfer berhasil diunggah! Pesanan Anda akan segera diproses.';
    order.value.orderStatus = data.order.orderStatus;
    order.value.proofOfTransferImage = data.order.proofOfTransferImage;

    $q.notify({
      type: 'positive',
      message: uploadSuccess.value,
      position: 'top',
      timeout: 3000
    });
    console.log('[ConfirmPaymentView] Proof of transfer uploaded successfully:', data);

  } catch (err) {
    console.error('[ConfirmPaymentView] Gagal mengunggah bukti transfer:', err);
    let errorMessage = 'Terjadi kesalahan saat mengunggah bukti transfer.';
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    uploadError.value = errorMessage; // Set uploadError.value di sini

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });

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
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Menggunakan warna Quasar untuk badge status
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending Payment': return 'yellow-8';
    case 'Processing': return 'blue-8';
    case 'Shipped': return 'purple-8';
    case 'Completed': return 'green-8';
    case 'Cancelled':
    case 'Cancelled by Customer': return 'red-8';
    default: return 'grey-7';
  }
};

const getImageUrl = (imagePath) => {
  const baseUrl = `http://${BE_PRE_URL}`;
  console.log('[ConfirmPaymentView] Generating image URL for:', imagePath, 'Base URL used:', baseUrl);

  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }

  // Pastikan path dimulai dengan slash jika itu adalah path relatif
  const finalImagePath = imagePath && !imagePath.startsWith('/') ? `/${imagePath}` : imagePath;
  return `${baseUrl}${finalImagePath}`;
};
</script>

<style scoped>
/* Custom CSS untuk border jika q-separator Quasar tidak cukup */
.border-b-grey-3 {
  border-bottom: 1px solid #e0e0e0; /* Quasar's grey-3 */
}
.border-blue-3 {
  border: 1px solid #90CAF9; /* Quasar's blue-3 */
}
</style>
