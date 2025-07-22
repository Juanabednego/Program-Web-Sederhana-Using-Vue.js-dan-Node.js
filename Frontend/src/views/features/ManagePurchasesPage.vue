<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800">Daftar Pembelian (Orders)</h2>
      <button
        @click="fetchPurchases"
        :disabled="loading"
        class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded transition duration-200 flex items-center space-x-2"
      >
        <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span v-if="loading">Memuat Ulang...</span>
        <span v-else>Muat Ulang</span>
      </button>
    </div>

    <div class="mb-4">
      <input
        type="text"
        v-model="filter"
        placeholder="Cari ID Pembelian, Nama Pembeli, Status..."
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-lg text-gray-600">Memuat data pembelian...</p>
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mt-4"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredPurchases.length === 0" class="text-center py-8">
      <p class="text-lg text-gray-600">Tidak ada data pembelian yang tersedia atau sesuai filter.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-x-auto">
      <!-- Removed overflow-hidden to allow dropdown to show -->
      <table class="min-w-full leading-normal">
        <thead>
          <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th class="py-3 px-6 text-left">ID Pembelian</th>
            <th class="py-3 px-6 text-left">Pembeli</th>
            <th class="py-3 px-6 text-right">Jumlah Total</th>
            <th class="py-3 px-6 text-center">Status Pesanan</th>
            <th class="py-3 px-6 text-center">Status Pembayaran</th>
            <th class="py-3 px-6 text-center">Status Pengiriman</th>
            <th class="py-3 px-6 text-left">Tanggal Pembelian</th>
            <th class="py-3 px-6 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="text-gray-700 text-sm relative">
          <tr v-for="(purchase, index) in filteredPurchases" :key="purchase._id" class="border-b border-gray-200 hover:bg-gray-100">
            <td class="py-3 px-6 text-left whitespace-nowrap font-mono text-xs">{{ purchase._id }}</td>
            <td class="py-3 px-6 text-left">{{ purchase.user ? purchase.user.name : 'N/A' }}</td>
            <td class="py-3 px-6 text-right font-semibold">{{ formatCurrency(purchase.totalPrice) }}</td>
            <td class="py-3 px-6 text-center">
              <span :class="getStatusBadgeClass(purchase.orderStatus)">{{ purchase.orderStatus }}</span>
            </td>
            <td class="py-3 px-6 text-center">
              <span :class="purchase.isPaid ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'"
                    class="py-1 px-3 rounded-full text-xs font-semibold">
                {{ purchase.isPaid ? 'Sudah Dibayar' : 'Belum Dibayar' }}
              </span>
            </td>
            <td class="py-3 px-6 text-center">
              <span :class="purchase.isDelivered ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'"
                    class="py-1 px-3 rounded-full text-xs font-semibold">
                {{ purchase.isDelivered ? 'Sudah Dikirim' : 'Belum Dikirim' }}
              </span>
            </td>
            <td class="py-3 px-6 text-left">{{ formatDate(purchase.createdAt) }}</td>
            <td class="py-3 px-6 text-center relative">
              <button
                @click="toggleActions(purchase._id, index)"
                :disabled="actionLoading"
                class="text-blue-600 hover:text-blue-900 disabled:text-blue-300 px-3 py-1 rounded border border-blue-600 hover:border-blue-900 disabled:border-blue-300 transition-colors flex items-center space-x-1"
                title="Aksi"
              >
                <span>Aksi</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Actions Dropdown with dynamic positioning -->
              <div v-if="activeActions === purchase._id" 
                   :class="[
                     'absolute w-56 bg-white border border-gray-200 rounded-md shadow-lg',
                     getDropdownPosition(index)
                   ]">
                <!-- Status Update Actions -->
                <div class="border-b border-gray-100 pb-2">
                  <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Status</div>
                  
                  <button
                    @click="updateOrderStatus(purchase._id, 'Processing')"
                    v-if="purchase.orderStatus !== 'Processing' && purchase.orderStatus !== 'Completed' && purchase.orderStatus !== 'Cancelled'"
                    :disabled="actionLoading"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoading && currentAction === `status-${purchase._id}-Processing`" class="inline-block animate-spin w-3 h-3 border border-gray-600 border-t-transparent rounded-full mr-2"></span>
                    Set ke Processing
                  </button>
                  
                  <button
                    @click="updateOrderStatus(purchase._id, 'Shipped')"
                    v-if="purchase.orderStatus === 'Processing'"
                    :disabled="actionLoading"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoading && currentAction === `status-${purchase._id}-Shipped`" class="inline-block animate-spin w-3 h-3 border border-gray-600 border-t-transparent rounded-full mr-2"></span>
                    Set ke Shipped
                  </button>
                  
                  <button
                    @click="updateOrderStatus(purchase._id, 'Completed')"
                    v-if="purchase.orderStatus !== 'Completed' && purchase.orderStatus !== 'Cancelled'"
                    :disabled="actionLoading"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoading && currentAction === `status-${purchase._id}-Completed`" class="inline-block animate-spin w-3 h-3 border border-gray-600 border-t-transparent rounded-full mr-2"></span>
                    Set ke Completed
                  </button>
                </div>

                <!-- Payment and Delivery Actions -->
                <div class="border-b border-gray-100 pb-2">
                  <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment & Delivery</div>
                  
                  <button
                    @click="markOrderAsPaid(purchase._id)"
                    v-if="!purchase.isPaid"
                    :disabled="actionLoading"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoading && currentAction === `paid-${purchase._id}`" class="inline-block animate-spin w-3 h-3 border border-gray-600 border-t-transparent rounded-full mr-2"></span>
                    Tandai Sudah Dibayar
                  </button>
                  
                  <button
                    @click="markOrderAsDelivered(purchase._id)"
                    v-if="!purchase.isDelivered && (purchase.orderStatus === 'Shipped' || purchase.orderStatus === 'Processing')"
                    :disabled="actionLoading"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoading && currentAction === `delivered-${purchase._id}`" class="inline-block animate-spin w-3 h-3 border border-gray-600 border-t-transparent rounded-full mr-2"></span>
                    Tandai Sudah Dikirim
                  </button>
                </div>

                <!-- Danger Actions -->
                <div class="border-b border-gray-100 pb-2">
                  <button
                    @click="updateOrderStatus(purchase._id, 'Cancelled')"
                    v-if="purchase.orderStatus !== 'Cancelled' && purchase.orderStatus !== 'Completed'"
                    :disabled="actionLoading"
                    class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="actionLoading && currentAction === `status-${purchase._id}-Cancelled`" class="inline-block animate-spin w-3 h-3 border border-red-600 border-t-transparent rounded-full mr-2"></span>
                    Batalkan Pesanan
                  </button>
                </div>
                <!-- View Details -->
                <div>
                  <router-link 
                    :to="{ name: 'PurchaseDetail', params: { id: purchase._id } }"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="activeActions = null"
                  >
                    Lihat Detail Lengkap
                  </router-link>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Global Loading Overlay for Actions -->
    <div v-if="actionLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="text-gray-700">Memproses permintaan...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../../url/index.js';

const router = useRouter();

const purchases = ref([]);
const loading = ref(false);
const actionLoading = ref(false);
const filter = ref('');
const activeActions = ref(null);
const currentAction = ref('');
const activeActionIndex = ref(null); // Track the ifndex or positioning

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
      (purchase.user && purchase.user.name && purchase.user.name.toLowerCase().includes(lowerCaseFilter)) ||
      (purchase.orderStatus && purchase.orderStatus.toLowerCase().includes(lowerCaseFilter))
  );
});

// Toggle dropdown aksi with index tracking
const toggleActions = (purchaseId, index) => {
  if (actionLoading.value) return;
  if (activeActions.value === purchaseId) {
    activeActions.value = null;
    activeActionIndex.value = null;
  } else {
    activeActions.value = purchaseId;
    activeActionIndex.value = index;
  }
};

// Get dropdown position based on row index
const getDropdownPosition = (index) => {
  const totalItems = filteredPurchases.value.length;
  const isNearBottom = index >= totalItems - 3; // Last 3 items
  
  return [
    'right-0 mt-2 z-50', // Always right-aligned with high z-index
    isNearBottom ? 'bottom-full mb-2' : 'top-full' // Position above if near bottom
  ].join(' ');
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (activeActions.value && !event.target.closest('.relative')) {
    activeActions.value = null;
    activeActionIndex.value = null;
  }
};

const fetchPurchases = async () => {
  console.log('[ManagePurchases] Fetching purchases...');
  loading.value = true;
  activeActions.value = null;
  activeActionIndex.value = null;

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login sebagai admin untuk melihat daftar pembelian.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
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
  
  if (actionLoading.value) return;
  
  activeActions.value = null;
  activeActionIndex.value = null;
  if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan ${orderId} menjadi "${newStatus}"?`)) {
    return;
  }

  actionLoading.value = true;
  currentAction.value = `status-${orderId}-${newStatus}`;

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pesanan.');
    redirectToLogin();
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
    
    // Show success message
    showSuccessMessage(`Status pesanan berhasil diubah menjadi "${newStatus}".`);
    await fetchPurchases(); // Reload data
  } catch (error) {
    console.error('Error updating order status:', error);
    handleApiError(error, 'Gagal mengubah status pesanan');
  } finally {
    actionLoading.value = false;
    currentAction.value = '';
  }
};

const markOrderAsPaid = async (orderId) => {
  console.log(`[ManagePurchases] Attempting to mark order ${orderId} as paid.`);
  
  if (actionLoading.value) return;
  
  activeActions.value = null;
  activeActionIndex.value = null;
  if (!confirm(`Apakah Anda yakin ingin menandai pesanan ${orderId} sebagai sudah dibayar?`)) {
    return;
  }

  actionLoading.value = true;
  currentAction.value = `paid-${orderId}`;

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pembayaran.');
    redirectToLogin();
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
    
    showSuccessMessage('Pesanan berhasil ditandai sebagai sudah dibayar.');
    await fetchPurchases();
  } catch (error) {
    console.error('Error marking order as paid:', error);
    handleApiError(error, 'Gagal menandai pesanan sebagai sudah dibayar');
  } finally {
    actionLoading.value = false;
    currentAction.value = '';
  }
};

const markOrderAsDelivered = async (orderId) => {
  console.log(`[ManagePurchases] Attempting to mark order ${orderId} as delivered.`);
  
  if (actionLoading.value) return;
  
  activeActions.value = null;
  activeActionIndex.value = null;
  if (!confirm(`Apakah Anda yakin ingin menandai pesanan ${orderId} sebagai sudah dikirim?`)) {
    return;
  }

  actionLoading.value = true;
  currentAction.value = `delivered-${orderId}`;

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pengiriman.');
    redirectToLogin();
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
    
    showSuccessMessage('Pesanan berhasil ditandai sebagai sudah dikirim.');
    await fetchPurchases();
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    handleApiError(error, 'Gagal menandai pesanan sebagai sudah dikirim');
  } finally {
    actionLoading.value = false;
    currentAction.value = '';
  }
};

// Helper functions
const redirectToLogin = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('jwt');
  actionLoading.value = false;
  router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
};

const handleApiError = (error, defaultMessage = 'Terjadi kesalahan') => {
  if (error.response) {
    console.error('[ManagePurchases] Server Response Error:', error.response.data);
    console.error('[ManagePurchases] Status:', error.response.status);
    
    if (error.response.status === 401) {
      alert('Tidak Diotorisasi: Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
      redirectToLogin();
    } else if (error.response.status === 403) {
      alert('Tidak Diotorisasi: Anda tidak memiliki izin untuk melakukan tindakan ini.');
      router.push({ name: 'Home' });
    } else {
      const errorMessage = error.response.data.message || error.message || defaultMessage;
      alert(`${defaultMessage}: ${errorMessage}`);
    }
  } else if (error.request) {
    alert('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
  } else {
    alert(`${defaultMessage}: ${error.message}`);
  }
};

const showSuccessMessage = (message) => {
  // You can replace this with a more sophisticated notification system
  alert(message);
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

const getStatusBadgeClass = (status) => {
  if (!status) return 'bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold';
  switch (status.toLowerCase()) {
    case 'pending payment':
      return 'bg-yellow-200 text-yellow-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'processing':
    case 'paid':
      return 'bg-blue-200 text-blue-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'shipped':
      return 'bg-purple-200 text-purple-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'completed':
    case 'delivered':
      return 'bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'cancelled':
      return 'bg-red-200 text-red-800 py-1 px-3 rounded-full text-xs font-semibold';
    case 'refunded':
      return 'bg-orange-200 text-orange-800 py-1 px-3 rounded-full text-xs font-semibold';
    default:
      return 'bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold';
  }
};

onMounted(() => {
  fetchPurchases();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Custom styles for smooth transitions */
.transition-colors {
  transition: color 0.2s ease-in-out, border-color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

/* Ensure dropdown appears above other elements with high z-index */
.z-50 {
  z-index: 50;
}

/* Loading animation for small spinners */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Ensure table container doesn't clip dropdown */
.overflow-x-auto {
  overflow-y: visible;
}
</style>