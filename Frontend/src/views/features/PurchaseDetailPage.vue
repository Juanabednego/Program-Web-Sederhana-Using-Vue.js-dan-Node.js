<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center mb-6">
      <button
        @click="router.back()"
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200 mr-4"
      >
        &larr; Kembali
      </button>
      <h2 class="text-3xl font-bold text-gray-800">Detail Pembelian (ID: {{ purchaseId }})</h2>
    </div>

    <div v-if="loading" class="text-center py-8">
      <p class="text-lg text-gray-600">Memuat detail pembelian...</p>
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mt-4"></div>
    </div>

    <div v-else-if="purchase" class="bg-white shadow-md rounded-lg p-6">
      <h3 class="text-2xl font-semibold text-gray-700 mb-4">Informasi Pembelian</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-gray-600 text-sm">ID Pembelian:</p>
          <p class="text-gray-900 font-medium">{{ purchase._id }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Tanggal Pesanan:</p>
          <p class="text-gray-900 font-medium">{{ formatDate(purchase.createdAt) }}</p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Status Pesanan:</p>
          <p class="text-gray-900 font-medium">
            <span :class="getStatusBadgeClass(purchase.orderStatus)">{{ purchase.orderStatus }}</span>
          </p>
        </div>
        <div>
          <p class="text-gray-600 text-sm">Jumlah Total:</p>
          <p class="text-green-600 font-bold text-xl">{{ formatCurrency(purchase.totalPrice) }}</p>
        </div>
        <div v-if="purchase.paymentMethod">
          <p class="text-gray-600 text-sm">Metode Pembayaran:</p>
          <p class="text-gray-900 font-medium">{{ purchase.paymentMethod }}</p>
        </div>
        <div v-if="purchase.isPaid !== undefined">
          <p class="text-gray-600 text-sm">Status Pembayaran:</p>
          <p class="text-gray-900 font-medium">
            <span :class="purchase.isPaid ? 'text-green-600' : 'text-orange-600'">
              {{ purchase.isPaid ? 'Sudah Dibayar' + (purchase.paidAt ? ` pada ${formatDate(purchase.paidAt)}` : '') : 'Belum Dibayar' }}
            </span>
          </p>
        </div>
        <div v-if="purchase.isDelivered !== undefined">
          <p class="text-gray-600 text-sm">Status Pengiriman:</p>
          <p class="text-gray-900 font-medium">
            <span :class="purchase.isDelivered ? 'text-green-600' : 'text-orange-600'">
              {{ purchase.isDelivered ? 'Sudah Dikirim' + (purchase.deliveredAt ? ` pada ${formatDate(purchase.deliveredAt)}` : '') : 'Belum Dikirim' }}
            </span>
          </p>
        </div>
        <div v-if="purchase.proofOfTransfer">
            <p class="text-gray-600 text-sm">Bukti Transfer:</p>
            <a :href="getImageUrl(purchase.proofOfTransfer)" target="_blank" class="text-blue-600 hover:underline">
                <img :src="getImageUrl(purchase.proofOfTransfer)" alt="Bukti Transfer" class="max-w-xs h-auto rounded-lg shadow-md border border-gray-200 object-cover">
                <p class="text-sm mt-1">Klik untuk melihat gambar penuh</p>
            </a>
        </div>
      </div>

<div v-if="isAdmin" class="mt-6 p-6 bg-indigo-50 rounded-lg border border-indigo-200 shadow-lg">
  <h3 class="text-xl font-semibold text-blue-800 mb-4">Admin Aksi</h3>
  <div class="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-x-auto pb-2">

    <button
      @click="markOrderAsPaid(purchase._id)"
      v-if="!purchase.isPaid"
      class="min-w-[150px] bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
    >
      Tandai Sudah Dibayar  
    </button>
    <button
      @click="updateOrderStatus(purchase._id, 'Processing')"
      v-if="purchase.orderStatus === 'Pending Payment' || purchase.orderStatus === 'Paid'"
      class="min-w-[150px] bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
    >
      Set ke Processing
    </button>
    <button
      @click="updateOrderStatus(purchase._id, 'Shipped')"
      v-if="purchase.orderStatus === 'Processing' && !purchase.isDelivered"
      class="min-w-[150px] bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
    >
      Set ke Dikirim
    </button>
    <button
      @click="markOrderAsDelivered(purchase._id)"
      v-if="purchase.orderStatus === 'Shipped' && !purchase.isDelivered"
      class="min-w-[150px] bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
    >
      Tandai Sudah Dikirim
    </button>
    <button
      @click="updateOrderStatus(purchase._id, 'Completed')"
      v-if="purchase.isPaid && purchase.isDelivered && purchase.orderStatus !== 'Completed'"
      class="min-w-[150px] bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
    >
      Set ke Selesai
    </button>
    <button
      @click="updateOrderStatus(purchase._id, 'Cancelled')"
      v-if="purchase.orderStatus !== 'Cancelled' && purchase.orderStatus !== 'Completed'"
      class="min-w-[150px] bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-200"
    >
      Batalkan Pesanan
    </button>
  </div>
</div>

      <hr class="my-6 border-gray-200" />

      <h3 class="text-2xl font-semibold text-gray-700 mb-4">Informasi Pembeli</h3>
      <div v-if="purchase.user" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p class="text-gray-600 text-sm">Nama Pembeli:</p>
          <p class="text-gray-900 font-medium">{{ purchase.user.nama }}</p>
        </div>
        <div>
        <p class="text-gray-600 text-sm">Email Pembeli:</p>
          <p class="text-gray-900 font-medium">{{ purchase.user.email }}</p>
      </div>  
        <div>
          <p class="text-gray-600 text-sm">Alamat Pengiriman:</p>
          <p class="text-gray-900 font-medium">
            {{ purchase.shippingAddress?.address }}, {{ purchase.shippingAddress?.city }},
            {{ purchase.shippingAddress?.postalCode }}, {{ purchase.shippingAddress?.country }}
          </p>
        </div>
      </div>
      <p v-else class="text-gray-500">Informasi pembeli tidak tersedia.</p>

      <hr class="my-6 border-gray-200" />

      <h3 class="text-2xl font-semibold text-gray-700 mb-4">Item-item Pembelian</h3>
      <div v-if="purchase.orderItems && purchase.orderItems.length > 0" class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th class="py-3 px-6 text-left">Nama Produk</th>
              <th class="py-3 px-6 text-center">Gambar</th>
              <th class="py-3 px-6 text-center">Kuantitas</th>
              <th class="py-3 px-6 text-right">Harga Satuan</th>
              <th class="py-3 px-6 text-right">Total</th>
            </tr>
          </thead>
          <tbody class="text-gray-700 text-sm">
            <tr v-for="item in purchase.orderItems" :key="item.product" class="border-b border-gray-200 hover:bg-gray-100">
              <td class="py-3 px-6 text-left">{{ item.name }}</td>
              <td class="py-3 px-6 text-center">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="w-12 h-12 object-cover rounded mx-auto" />
                <span v-else>No Image</span>
              </td>
              <td class="py-3 px-6 text-center">{{ item.quantity }}</td>
              <td class="py-3 px-6 text-right">{{ formatCurrency(item.price) }}</td>
              <td class="py-3 px-6 text-right">{{ formatCurrency(item.quantity * item.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-gray-500">Tidak ada item dalam pembelian ini.</p>

      <hr class="my-6 border-gray-200" />
       <div class="mt-6 pt-4 border-t-2 border-gray-200">
        <div class="flex justify-between items-center text-lg">
          <span>Subtotal Barang:</span>
          <span class="font-bold">{{ formatCurrency(purchase.itemsPrice) }}</span>
        </div>
        <div class="flex justify-between items-center text-lg">
          <span>Ongkos Kirim:</span>
          <span class="font-bold">{{ formatCurrency(purchase.shippingPrice) }}</span>
        </div>
        <div class="flex justify-between items-center text-lg mb-2">
          <span>Pajak:</span>
          <span class="font-bold">{{ formatCurrency(purchase.taxPrice) }}</span>
        </div>
        <div class="flex justify-between items-center text-2xl font-bold text-blue-700">
          <span>Total Pembayaran:</span>
          <span>{{ formatCurrency(purchase.totalPrice) }}</span>
        </div>
      </div>

    </div>

    <div v-else class="bg-white shadow-md rounded-lg p-6 text-center text-red-600">
      <p class="text-lg">Gagal memuat detail pembelian atau pembelian tidak ditemukan.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../../url/index.js'; // Sesuaikan path jika berbeda

const route = useRoute();
const router = useRouter();

const purchaseId = ref(route.params.id);
const purchase = ref(null);
const loading = ref(true);
const isAdmin = ref(false); // New state to check if the current user is an admin

// Helper function to get user info and token consistently
function getUserInfoFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = localStorage.getItem('jwt');
  console.log('[PurchaseDetail] Attempting to get user info from localStorage...');
  console.log('  userData found:', !!user);
  console.log('  jwt token found:', !!token);

  if (!user || !token) {
    console.warn('[PurchaseDetail] User data or JWT token is missing in localStorage.');
    return null;
  }

  try {
    const parsedUser = JSON.parse(user);
    parsedUser.token = token; // Attach the token to the user object
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
  try {
    const userInfo = getUserInfoFromLocalStorage();
    if (!userInfo || !userInfo.token) {
      alert('Anda harus login untuk melihat detail pembelian ini. Token autentikasi tidak ditemukan.');
      localStorage.removeItem('userData'); // Clean up potentially corrupt data
      localStorage.removeItem('jwt');
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
    const response = await axios.get(`http://${BE_PRE_URL}/orders/${purchaseId.value}`, config);
    purchase.value = response.data;
    console.log('[PurchaseDetail] Purchase details fetched successfully:', response.data);
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    if (error.response) {
      console.error('[PurchaseDetail] Server Response Error:', error.response.data);
      console.error('[PurchaseDetail] Status:', error.response.status);
      if (error.response.status === 401) {
        alert('Tidak Diotorisasi: Sesi Anda telah berakhir atau token tidak valid. Silakan login kembali.');
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      } else if (error.response.status === 404) {
        alert('Detail pembelian tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.');
      } else if (error.response.status === 403) { // Specific check for forbidden if a regular user tries to access another's order
        alert('Tidak Diotorisasi: Anda tidak memiliki izin untuk melihat pesanan ini.');
        router.push({ name: 'Home' }); // Or whatever appropriate redirect
      }
      else {
        alert('Gagal memuat detail pembelian: ' + (error.response.data.message || error.message));
      }
    } else if (error.request) {
      alert('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    } else {
      alert('Terjadi kesalahan tidak terduga: ' + error.message);
    }
    purchase.value = null; // Clear purchase on error
  } finally {
    loading.value = false;
    console.log('[PurchaseDetail] Fetch process finished.');
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  console.log(`[PurchaseDetail] Attempting to update order ${orderId} status to: ${newStatus}`);
  if (!confirm(`Apakah Anda yakin ingin mengubah status pesanan ini menjadi "${newStatus}"?`)) {
    return;
  }

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pesanan.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: route.fullPath } });
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
    
    console.log(`[PurchaseDetail] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/status with body:`, body);
    await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/status`, body, config);
    
    alert(`Status pesanan berhasil diubah menjadi "${newStatus}".`);
    fetchPurchaseDetails(); // Muat ulang detail untuk menampilkan perubahan
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error.response) {
      console.error('[PurchaseDetail] Server Response Error:', error.response.data);
      alert('Gagal mengubah status pesanan: ' + (error.response.data.message || error.message));
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      }
    } else if (error.request) {
      alert('Tidak dapat terhubung ke server untuk mengubah status.');
    } else {
      alert('Terjadi kesalahan saat mengubah status: ' + error.message);
    }
  }
};

const markOrderAsPaid = async (orderId) => {
  console.log(`[PurchaseDetail] Attempting to mark order ${orderId} as paid.`);
  if (!confirm(`Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dibayar?`)) {
    return;
  }

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pembayaran.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: route.fullPath } });
    return;
  }

  try { 
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    console.log(`[PurchaseDetail] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/pay`);
    await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/pay`, {}, config);
    
    alert(`Pesanan berhasil ditandai sebagai sudah dibayar.`);
    fetchPurchaseDetails(); // Muat ulang detail untuk menampilkan perubahan
  } catch (error) {
    console.error('Error marking order as paid:', error);
    if (error.response) {
      alert('Gagal menandai pesanan sebagai sudah dibayar: ' + (error.response.data.message || error.message));
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      }
    } else {
      alert('Terjadi kesalahan saat menandai pembayaran: ' + error.message);
    }
  }
};

const markOrderAsDelivered = async (orderId) => {
  console.log(`[PurchaseDetail] Attempting to mark order ${orderId} as delivered.`);
  if (!confirm(`Apakah Anda yakin ingin menandai pesanan ini sebagai sudah dikirim?`)) {
    return;
  }

  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo || !userInfo.token) {
    alert('Anda harus login untuk mengubah status pengiriman.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    router.push({ name: 'Login', query: { redirect: route.fullPath } });
    return;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    
    console.log(`[PurchaseDetail] Sending PUT request to: http://${BE_PRE_URL}/orders/${orderId}/deliver`);
    await axios.put(`http://${BE_PRE_URL}/orders/${orderId}/deliver`, {}, config);
    
    alert(`Pesanan berhasil ditandai sebagai sudah dikirim.`);
    fetchPurchaseDetails(); // Muat ulang detail untuk menampilkan perubahan
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    if (error.response) {
      alert('Gagal menandai pesanan sebagai sudah dikirim: ' + (error.response.data.message || error.message));
      if (error.response.status === 401 || error.response.status === 403) {
        localStorage.removeItem('userData');
        localStorage.removeItem('jwt');
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
      }
    } else {
      alert('Terjadi kesalahan saat menandai pengiriman: ' + error.message);
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
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
  }
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
    default:
      return 'bg-gray-200 text-gray-800 py-1 px-3 rounded-full text-xs font-semibold';
  }
};

const getImageUrl = (imagePath) => {
  const baseUrl = `http://${BE_PRE_URL}`.replace('/api/v1', '');
  console.log('[PurchaseDetail] Generating image URL for:', imagePath, 'Base URL used:', baseUrl);
  const finalImagePath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${finalImagePath}`;
};

onMounted(() => {
  console.log('[PurchaseDetail] Component mounted. Purchase ID from route:', purchaseId.value);
  if (purchaseId.value) {
    fetchPurchaseDetails();
  } else {
    loading.value = false;
    alert('ID Pembelian tidak ditemukan di URL.');
    router.push({ name: 'UserPurchases' }); // Redirect back to list if ID is missing
  }
});
</script>

<style scoped>
/* Anda bisa menambahkan styling tambahan di sini, atau mengandalkan Tailwind */
</style>
