<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="q-mx-auto q-px-md q-py-lg" style="max-width: 1200px;">
      <div class="flex items-center justify-between q-mb-lg">
        <div class="text-h4 text-weight-bold text-grey-9">Daftar Pembelian</div>
        <div class="flex q-gutter-sm">
          <q-btn
            @click="fetchPurchases"
            :loading="loading"
            color="blue-7"
            icon="refresh"
            label="Muat Ulang"
            unelevated
          />
          <q-btn
            @click="showFinancialReportModal = true; fetchFinancialReport();"
            color="green-7"
            icon="print"
            label="Laporan Keuangan"
            unelevated
            :loading="loadingFinancialReport"
          />
        </div>
      </div>

      <div class="q-mb-md">
        <q-input
          filled
          v-model="filter"
          placeholder="Cari ID Pembelian, Nama Pembeli, Status..."
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
        <div class="text-h6 text-grey-7">Memuat data pembelian...</div>
      </div>

      <!-- No Data State -->
      <div v-else-if="filteredPurchases.length === 0" class="text-center q-py-xl">
        <q-icon name="info" size="xl" color="grey-4" class="q-mb-md" />
        <p class="text-h6 text-grey-7">Tidak ada data pembelian yang tersedia atau sesuai filter.</p>
      </div>

      <!-- Purchases Table -->
      <div v-else>
        <q-card class="shadow-2 rounded-borders overflow-hidden">
          <q-table
            :rows="filteredPurchases"
            :columns="columns"
            row-key="_id"
            hide-bottom
            flat
            :rows-per-page="0"
             virtual-scroll
            :virtual-scroll-item-size="72"  
            :rows-per-page-options="[0]"
            :pagination="{
              page: 1,
              rowsPerPage: 0
            }"
            style="max-height: 500px; overflow-y: auto;"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-grey-1">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-left text-grey-7 text-weight-medium text-uppercase">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="id_pembelian" :props="props" class="font-mono text-caption">
                  {{ props.row._id.slice(-8) }}
                </q-td>
                <q-td key="pembeli" :props="props">
                  {{ props.row.user ? props.row.user.nama : 'N/A' }}
                </q-td>
                <q-td key="jumlah_total" :props="props" class="text-right text-weight-semibold">
                  {{ formatCurrency(props.row.totalPrice) }}
                </q-td>
                <q-td key="status_pesanan" :props="props" class="text-center">
                  <q-badge :color="getOrderStatusColor(props.row.orderStatus)" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                    {{ props.row.orderStatus }}
                  </q-badge>
                </q-td>
                <q-td key="status_pembayaran" :props="props" class="text-center">
                  <q-badge :color="props.row.isPaid ? 'green-7' : 'orange-8'" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                    {{ props.row.isPaid ? 'Sudah Dibayar' : 'Belum Dibayar' }}
                  </q-badge>
                </q-td>
                <q-td key="status_pengiriman" :props="props" class="text-center">
                  <q-badge :color="props.row.isDelivered ? 'green-7' : 'orange-8'" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                    {{ props.row.isDelivered ? 'Sudah Dikirim' : 'Belum Dikirim' }}
                  </q-badge>
                </q-td>
                <q-td key="tanggal_pembelian" :props="props">
                  {{ formatDate(props.row.createdAt) }}
                </q-td>
                <q-td key="aksi" :props="props" class="text-center">
                  <q-btn-dropdown
                    flat
                    dense
                    icon="more_vert"
                    color="grey-7"
                    dropdown-icon="arrow_drop_down"
                    content-class="shadow-2 rounded-borders"
                    class="q-mr-sm"
                  >
                    <q-list dense>
                      <q-item-label header class="text-weight-bold text-uppercase text-caption text-grey-7">Update Status</q-item-label>
                      <q-item
                        clickable
                        v-close-popup
                        @click="updateOrderStatus(props.row._id, 'Processing')"
                        v-if="props.row.orderStatus !== 'Processing' && props.row.orderStatus !== 'Completed' && props.row.orderStatus !== 'Cancelled'"
                        :disable="actionLoading"
                      >
                        <q-item-section>Set ke Processing</q-item-section>
                        <q-item-section v-if="actionLoading && currentAction === `status-${props.row._id}-Processing`" side>
                          <q-spinner-dots size="1.5em" color="blue-7" />
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="updateOrderStatus(props.row._id, 'Shipped')"
                        v-if="props.row.orderStatus === 'Processing'"
                        :disable="actionLoading"
                      >
                        <q-item-section>Set ke Shipped</q-item-section>
                        <q-item-section v-if="actionLoading && currentAction === `status-${props.row._id}-Shipped`" side>
                          <q-spinner-dots size="1.5em" color="blue-7" />
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="updateOrderStatus(props.row._id, 'Completed')"
                        v-if="props.row.orderStatus !== 'Completed' && props.row.orderStatus !== 'Cancelled'"
                        :disable="actionLoading"
                      >
                        <q-item-section>Set ke Completed</q-item-section>
                        <q-item-section v-if="actionLoading && currentAction === `status-${props.row._id}-Completed`" side>
                          <q-spinner-dots size="1.5em" color="blue-7" />
                        </q-item-section>
                      </q-item>

                      <q-item-label header class="text-weight-bold text-uppercase text-caption text-grey-7 q-mt-sm">Payment & Delivery</q-item-label>
                      <q-item
                        clickable
                        v-close-popup
                        @click="markOrderAsPaid(props.row._id)"
                        v-if="!props.row.isPaid"
                        :disable="actionLoading"
                      >
                        <q-item-section>Tandai Sudah Dibayar</q-item-section>
                        <q-item-section v-if="actionLoading && currentAction === `paid-${props.row._id}`" side>
                          <q-spinner-dots size="1.5em" color="blue-7" />
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="markOrderAsDelivered(props.row._id)"
                        v-if="!props.row.isDelivered && (props.row.orderStatus === 'Shipped' || props.row.orderStatus === 'Processing')"
                        :disable="actionLoading"
                      >
                        <q-item-section>Tandai Sudah Dikirim</q-item-section>
                        <q-item-section v-if="actionLoading && currentAction === `delivered-${props.row._id}`" side>
                          <q-spinner-dots size="1.5em" color="blue-7" />
                        </q-item-section>
                      </q-item>

                      <q-separator />

                      <q-item
                        clickable
                        v-close-popup
                        @click="updateOrderStatus(props.row._id, 'Cancelled')"
                        v-if="props.row.orderStatus !== 'Cancelled' && props.row.orderStatus !== 'Completed'"
                        :disable="actionLoading"
                      >
                        <q-item-section class="text-red-7">Batalkan Pesanan</q-item-section>
                        <q-item-section v-if="actionLoading && currentAction === `status-${props.row._id}-Cancelled`" side>
                          <q-spinner-dots size="1.5em" color="red-7" />
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        :to="{ name: 'PurchaseDetail', params: { id: props.row._id } }"
                      >
                        <q-item-section>Lihat Detail Lengkap</q-item-section>
                        <q-item-section side>
                          <q-icon name="visibility" color="grey-7" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- Financial Report Modal (Quasar Dialog) -->
    <q-dialog v-model="showFinancialReportModal" maximized persistent>
      <q-card class="q-dialog-plugin q-pa-md">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h5 text-weight-bold text-grey-9">Laporan Keuangan Pesanan Selesai</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showFinancialReportModal = false" />
        </q-card-section>

        <q-card-section v-if="loadingFinancialReport" class="text-center q-py-xl">
          <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
          <div class="text-h6 text-grey-7">Memuat data laporan keuangan...</div>
        </q-card-section>

        <q-banner v-else-if="financialReportError" class="bg-red-1 text-red-8 q-mb-lg rounded-borders q-mx-auto">
          <template v-slot:avatar>
            <q-icon name="error" color="red-4" />
          </template>
          <div class="text-body1 text-weight-bold">{{ financialReportError }}</div>
        </q-banner>

        <q-card-section v-else class="financial-report-content q-pt-none">
          <div class="flex justify-end q-gutter-sm q-mb-md no-print">
            <q-btn @click="printReport" color="indigo-7" icon="print" label="Cetak Laporan" unelevated />
            <q-btn @click="downloadExcelReport" color="green-7" icon="download" label="Unduh Excel" unelevated />
            <q-btn @click="downloadPdfReport" color="red-7" icon="picture_as_pdf" label="Unduh PDF" unelevated />
          </div>

          <!-- Summary Section -->
          <div class="text-h6 text-weight-semibold q-mb-md">Ringkasan per Bulan</div>
          <div v-if="financialReportData.summary && financialReportData.summary.length > 0" class="q-mb-lg">
            <q-table
              :rows="financialReportData.summary"
              :columns="summaryColumns"
              row-key="_id.year + '-' + _id.month"
              hide-bottom
              flat
             :rows-per-page-options="0"
              bordered
            >
              <template v-slot:body-cell-month_year="props">
                <q-td :props="props">
                  {{ formatMonthYear(props.row._id.year, props.row._id.month) }}
                </q-td>
              </template>
              <template v-slot:body-cell-total_revenue="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.totalRevenue) }}
                </q-td>
              </template>
            </q-table>
          </div>
          <p v-else class="text-grey-7 italic">Tidak ada ringkasan laporan keuangan yang tersedia.</p>

          <!-- Details Section -->
          <div class="text-h6 text-weight-semibold q-mt-lg q-mb-md">Detail Pesanan Selesai</div>
          <div v-if="financialReportData.details && financialReportData.details.length > 0">
            <q-table
              :rows="financialReportData.details"
              :columns="detailColumns"
              row-key="_id"
              hide-bottom
              flat
              bordered
              :rows-per-page="0"
            >
              <template v-slot:body-cell-order_id="props">
                <q-td :props="props" class="text-caption">
                  {{ props.row._id.slice(-8) }}
                </q-td>
              </template>
              <template v-slot:body-cell-date="props">
                <q-td :props="props">
                  {{ formatDate(props.row.createdAt) }}
                </q-td>
              </template>
              <template v-slot:body-cell-buyer="props">
                <q-td :props="props">
                  {{ props.row.user ? props.row.user.nama : 'N/A' }}
                </q-td>
              </template>
              <template v-slot:body-cell-total_price="props">
                <q-td :props="props" class="text-right">
                  {{ formatCurrency(props.row.totalPrice) }}
                </q-td>
              </template>
              <template v-slot:body-cell-items="props">
                <q-td :props="props" class="text-caption">
                  {{ props.row.orderItems.map(item => `${item.name} (${item.quantity}x)`).join(', ') }}
                </q-td>
              </template>
            </q-table>
          </div>
          <p v-else class="text-grey-7 italic">Tidak ada detail pesanan selesai yang tersedia.</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js';

const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance

const purchases = ref([]);
const loading = ref(false);
const actionLoading = ref(false);
const filter = ref('');
const currentAction = ref(''); // Untuk melacak aksi yang sedang berlangsung (untuk spinner)

// New states for Financial Report
const showFinancialReportModal = ref(false);
const financialReportData = ref({ summary: [], details: [] });
const loadingFinancialReport = ref(false);
const financialReportError = ref(null);

// QTable columns definition for main purchases table
const columns = [
  { name: 'id_pembelian', required: true, label: 'ID Pembelian', align: 'left', field: '_id', sortable: true },
  { name: 'pembeli', label: 'Pembeli', align: 'left', field: row => row.user ? row.user.nama : 'N/A', sortable: true },
  { name: 'jumlah_total', label: 'Jumlah Total', align: 'right', field: 'totalPrice', sortable: true, format: val => formatCurrency(val) },
  { name: 'status_pesanan', label: 'Status Pesanan', align: 'center', field: 'orderStatus', sortable: true },
  { name: 'status_pembayaran', label: 'Status Pembayaran', align: 'center', field: 'isPaid', sortable: true },
  { name: 'status_pengiriman', label: 'Status Pengiriman', align: 'center', field: 'isDelivered', sortable: true },
  { name: 'tanggal_pembelian', label: 'Tanggal Pembelian', align: 'left', field: 'createdAt', sortable: true, format: val => formatDate(val) },
  { name: 'aksi', label: 'Aksi', align: 'center' }
];

// QTable columns definition for financial report summary
const summaryColumns = [
  { name: 'month_year', label: 'Bulan/Tahun', align: 'left', field: row => `${row._id.year}-${row._id.month}` },
  { name: 'total_revenue', label: 'Total Pendapatan', align: 'right', field: 'totalRevenue', format: val => formatCurrency(val) },
  { name: 'total_orders', label: 'Jumlah Pesanan', align: 'center', field: 'totalOrders' }
];

// QTable columns definition for financial report details
const detailColumns = [
  { name: 'order_id', label: 'ID Pesanan', align: 'left', field: '_id' },
  { name: 'date', label: 'Tanggal', align: 'left', field: 'createdAt', format: val => formatDate(val) },
  { name: 'buyer', label: 'Pembeli', align: 'left', field: row => row.user ? row.user.nama : 'N/A' },
  { name: 'total_price', label: 'Total Harga', align: 'right', field: 'totalPrice', format: val => formatCurrency(val) },
  { name: 'payment_method', label: 'Metode Pembayaran', align: 'left', field: 'paymentMethod' },
  { name: 'items', label: 'Items', align: 'left', field: 'orderItems' }
];


// Helper function to get user info and token consistently
function getUserInfoFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = localStorage.getItem('jwt');
  console.log('[ManagePurchases] Attempting to get user info from localStorage...');
  console.log('  userData found:', !!user);
  console.log('  jwt token found:', !!token);

  if (!user || !token) {
    console.warn('[ManagePurchases] User data or JWT token is missing in localStorage.');
    return null;
  }

  try {
    const parsedUser = JSON.parse(user);
    parsedUser.token = token;
    console.log('[ManagePurchases] Successfully retrieved user info with token.');
    return parsedUser;
  } catch (e) {
    console.error('[ManagePurchases] Error parsing user data from localStorage:', e);
    return null;
  }
}

const filteredPurchases = computed(() => {
  if (!filter.value) {
    return purchases.value;
  }
  const lowerCaseFilter = filter.value.toLowerCase();
  return purchases.value.filter(
    (purchase) =>
      purchase._id.toLowerCase().includes(lowerCaseFilter) ||
      (purchase.user && purchase.user.nama && purchase.user.nama.toLowerCase().includes(lowerCaseFilter)) ||
      (purchase.orderStatus && purchase.orderStatus.toLowerCase().includes(lowerCaseFilter))
  );
});

const fetchPurchases = async () => {
  console.log('[ManagePurchases] Fetching purchases...');
  loading.value = true;

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    $q.notify({
      type: 'negative',
      message: 'Anda harus login sebagai admin untuk melihat daftar pembelian.',
      position: 'top',
      timeout: 3000
    });
    redirectToLogin();
    loading.value = false;
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    console.log(`[ManagePurchases] Sending GET request to: http://${BE_PRE_URL}/orders`);
    const response = await axios.get(`http://${BE_PRE_URL}/orders`, config);

    purchases.value = response.data;
    console.log('[ManagePurchases] Purchases data fetched successfully:', response.data.length, 'items.');
  } catch (error) {
    console.error('Error fetching purchases:', error);
    handleApiError(error);
  } finally {
    loading.value = false;
    console.log('[ManagePurchases] Fetch process finished.');
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  console.log(`[ManagePurchases] Attempting to update order ${orderId} status to: ${newStatus}`);

  $q.dialog({
    title: 'Konfirmasi Perubahan Status',
    message: `Apakah Anda yakin ingin mengubah status pesanan ini menjadi "${newStatus}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    actionLoading.value = true;
    currentAction.value = `status-${orderId}-${newStatus}`;

    const userInfo = getUserInfoFromLocalStorage();
    if (!userInfo || !userInfo.token) {
      $q.notify({
        type: 'negative',
        message: 'Anda harus login untuk mengubah status pesanan.',
        position: 'top',
        timeout: 3000
      });
      redirectToLogin();
      actionLoading.value = false;
      currentAction.value = '';
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const body = { orderStatus: newStatus };

      console.log(`[ManagePurchases] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/status with body:`, body);
      await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/status`, body, config);

      $q.notify({
        type: 'positive',
        message: `Status pesanan berhasil diubah menjadi "${newStatus}".`,
        position: 'top',
        timeout: 2000
      });
      await fetchPurchases(); // Reload data
    } catch (error) {
      console.error('Error updating order status:', error);
      handleApiError(error, 'Gagal mengubah status pesanan');
    } finally {
      actionLoading.value = false;
      currentAction.value = '';
    }
  });
};

const markOrderAsPaid = async (orderId) => {
  console.log(`[ManagePurchases] Attempting to mark order ${orderId} as paid.`);

  $q.dialog({
    title: 'Konfirmasi Pembayaran',
    message: `Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dibayar?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    actionLoading.value = true;
    currentAction.value = `paid-${orderId}`;

    const userInfo = getUserInfoFromLocalStorage();
    if (!userInfo || !userInfo.token) {
      $q.notify({
        type: 'negative',
        message: 'Anda harus login untuk mengubah status pembayaran.',
        position: 'top',
        timeout: 3000
      });
      redirectToLogin();
      actionLoading.value = false;
      currentAction.value = '';
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      console.log(`[ManagePurchases] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/pay`);
      await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/pay`, {}, config);

      $q.notify({
        type: 'positive',
        message: 'Pesanan berhasil ditandai sebagai sudah dibayar.',
        position: 'top',
        timeout: 2000
      });
      await fetchPurchases();
    } catch (error) {
      console.error('Error marking order as paid:', error);
      handleApiError(error, 'Gagal menandai pesanan sebagai sudah dibayar');
    } finally {
      actionLoading.value = false;
      currentAction.value = '';
    }
  });
};

const markOrderAsDelivered = async (orderId) => {
  console.log(`[ManagePurchases] Attempting to mark order ${orderId} as delivered.`);

  $q.dialog({
    title: 'Konfirmasi Pengiriman',
    message: `Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dikirim?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    actionLoading.value = true;
    currentAction.value = `delivered-${orderId}`;

    const userInfo = getUserInfoFromLocalStorage();
    if (!userInfo || !userInfo.token) {
      $q.notify({
        type: 'negative',
        message: 'Anda harus login untuk mengubah status pengiriman.',
        position: 'top',
        timeout: 3000
      });
      redirectToLogin();
      actionLoading.value = false;
      currentAction.value = '';
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      console.log(`[ManagePurchases] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/deliver`);
      await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/deliver`, {}, config);

      $q.notify({
        type: 'positive',
        message: 'Pesanan berhasil ditandai sebagai sudah dikirim.',
        position: 'top',
        timeout: 2000
      });
      await fetchPurchases();
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      handleApiError(error, 'Gagal menandai pesanan sebagai sudah dikirim');
    } finally {
      actionLoading.value = false;
      currentAction.value = '';
    }
  });
};

// Helper functions for API errors and redirection
const redirectToLogin = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('jwt');
  router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
};

const handleApiError = (error, defaultMessage = 'Terjadi kesalahan') => {
  if (error.response) {
    console.error('[ManagePurchases] Server Response Error:', error.response.data);
    console.error('[ManagePurchases] Status:', error.response.status);

    if (error.response.status === 401) {
      $q.notify({
        type: 'negative',
        message: 'Tidak Diotorisasi: Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.',
        position: 'top',
        timeout: 3000
      });
      redirectToLogin();
    } else if (error.response.status === 403) {
      $q.notify({
        type: 'negative',
        message: 'Tidak Diotorisasi: Anda tidak memiliki izin untuk melakukan tindakan ini.',
        position: 'top',
        timeout: 3000
      });
      router.push({ name: 'Home' });
    } else {
      const errorMessage = error.response.data.message || error.message || defaultMessage;
      $q.notify({
        type: 'negative',
        message: `${defaultMessage}: ${errorMessage}`,
        position: 'top',
        timeout: 3000
      });
    }
  } else if (error.request) {
    $q.notify({
      type: 'negative',
      message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.',
      position: 'top',
      timeout: 3000
    });
  } else {
    $q.notify({
      type: 'negative',
      message: `${defaultMessage}: ${error.message}`,
      position: 'top',
      timeout: 3000
    });
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// New function to format month and year for summary
const formatMonthYear = (year, month) => {
  const date = new Date(year, month - 1); // Month is 0-indexed
  return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
};

const getOrderStatusColor = (status) => {
  if (!status) return 'grey-7';
  switch (status.toLowerCase()) {
    case 'pending payment': return 'yellow-8';
    case 'processing': return 'blue-8';
    case 'shipped': return 'purple-8';
    case 'completed': return 'green-8';
    case 'cancelled': return 'red-8';
    case 'refunded': return 'grey-8';
    default: return 'grey-7';
  }
};

// Financial Report Functions
const fetchFinancialReport = async () => {
  loadingFinancialReport.value = true;
  financialReportError.value = null;
  financialReportData.value = { summary: [], details: [] };

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    financialReportError.value = 'Anda harus login sebagai admin untuk melihat laporan keuangan.';
    redirectToLogin();
    loadingFinancialReport.value = false;
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(`http://${BE_PRE_URL}/orders/financial-report`, config);
    financialReportData.value = response.data;
    console.log('[ManagePurchases] Financial Report Data:', financialReportData.value);
  } catch (error) {
    console.error('Error fetching financial report:', error);
    financialReportError.value = 'Gagal memuat laporan keuangan: ' + (error.response?.data?.message || error.message);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      redirectToLogin();
    }
  } finally {
    loadingFinancialReport.value = false;
  }
};

const printReport = () => {
  window.print();
};

const downloadExcelReport = async () => {
  $q.notify({
    type: 'info',
    message: 'Mempersiapkan unduhan Excel...',
    position: 'top',
    timeout: 0, // Stay indefinitely until dismissed or new notify
    actions: [{ icon: 'close', color: 'white' }]
  });
  loadingFinancialReport.value = true;
  financialReportError.value = null;

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    financialReportError.value = 'Anda harus login sebagai admin untuk mengunduh laporan.';
    redirectToLogin();
    loadingFinancialReport.value = false;
    $q.notify({ group: false }); // Dismiss previous notify
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
      responseType: 'blob', // Important for binary files
    };
    const response = await axios.get(`http://${BE_PRE_URL}/orders/financial-report/excel`, config);

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Laporan_Keuangan_Completed.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    $q.notify({
      type: 'positive',
      message: 'Laporan Excel berhasil diunduh!',
      position: 'top',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error downloading Excel report:', error);
    financialReportError.value = 'Gagal mengunduh laporan Excel: ' + (error.response?.data?.message || error.message);
    $q.notify({
      type: 'negative',
      message: financialReportError.value,
      position: 'top',
      timeout: 3000
    });
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      redirectToLogin();
    }
  } finally {
    loadingFinancialReport.value = false;
    $q.notify({ group: false }); // Dismiss loading notify
  }
};

const downloadPdfReport = async () => {
  $q.notify({
    type: 'info',
    message: 'Mempersiapkan unduhan PDF...',
    position: 'top',
    timeout: 0, // Stay indefinitely until dismissed or new notify
    actions: [{ icon: 'close', color: 'white' }]
  });
  loadingFinancialReport.value = true;
  financialReportError.value = null;

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    financialReportError.value = 'Anda harus login sebagai admin untuk mengunduh laporan.';
    redirectToLogin();
    loadingFinancialReport.value = false;
    $q.notify({ group: false }); // Dismiss previous notify
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
      responseType: 'blob', // Important for binary files
    };
    const response = await axios.get(`http://${BE_PRE_URL}/orders/financial-report/pdf`, config);

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Laporan_Keuangan_Completed.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    $q.notify({
      type: 'positive',
      message: 'Laporan PDF berhasil diunduh!',
      position: 'top',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error downloading PDF report:', error);
    financialReportError.value = 'Gagal mengunduh laporan PDF: ' + (error.response?.data?.message || error.message);
    $q.notify({
      type: 'negative',
      message: financialReportError.value,
      position: 'top',
      timeout: 3000
    });
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      redirectToLogin();
    }
  } finally {
    loadingFinancialReport.value = false;
    $q.notify({ group: false }); // Dismiss loading notify
  }
};

onMounted(() => {
  fetchPurchases();
});

// No longer need handleClickOutside as q-btn-dropdown and q-dialog handle it internally
// onUnmounted(() => {
//   document.removeEventListener('click', handleClickOutside);
// });
</script>

<style scoped>
/* Custom print styles remain relevant for the modal content */
@media print {
  body * {
    visibility: hidden; /* Hide everything by default */
  }
  .financial-report-content, .financial-report-content * {
    visibility: visible; /* Make report content visible */
  }
  .financial-report-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    background-color: white;
  }
  .no-print {
    display: none !important; /* Hide elements with no-print class */
  }
  /* Ensure tables are properly formatted for print */
  .financial-report-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .financial-report-content th,
  .financial-report-content td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  .financial-report-content th {
    background-color: #f2f2f2;
  }
  /* Remove modal background and shadow for print */
  .fixed.inset-0.bg-black.bg-opacity-50 {
    background-color: transparent !important;
    box-shadow: none !important;
  }
  .max-w-4xl {
    box-shadow: none !important;
    border: none !important;
    max-width: none !important;
    width: auto !important;
    height: auto !important;
    overflow: visible tant;
  }
}
</style>
