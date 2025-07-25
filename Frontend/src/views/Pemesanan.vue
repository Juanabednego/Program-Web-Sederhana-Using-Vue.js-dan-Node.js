<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Riwayat Pemesanan</h1>
        <p class="text-gray-600">Kelola dan lacak semua pesanan Anda</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Memuat pesanan...</span>
      </div>

      <!-- Error State -->
      <div v-if="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && orders.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M7 12l3-3 3 3M7 12v9a2 2 0 002 2h2m-4-11h32M21 12v9a2 2 0 002 2h2m-4-11h12M7 12h12m20 0l-3-3-3 3m6 0v9a2 2 0 01-2 2h-2m4-11H21" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Belum ada pesanan</h3>
        <p class="text-gray-500">Anda belum memiliki pesanan apapun</p>
      </div>

      <!-- Orders List -->
      <div v-if="!loading && !error && orders.length > 0" class="space-y-6">
        <div v-for="order in orders" :key="order._id" class="bg-white rounded-lg shadow-md overflow-hidden">
          <!-- Order Header -->
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center space-x-4">
                  <h3 class="text-lg font-semibold text-gray-900">Order #{{ order._id.slice(-8) }}</h3>
                  <span :class="getStatusBadgeClass(order.orderStatus)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ order.orderStatus }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  Dipesan pada: {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-gray-900">
                  Rp {{ formatCurrency(order.totalPrice) }}
                </p>
                <p class="text-sm text-gray-500">{{ order.orderItems.length }} item</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="px-6 py-4">
            <div class="space-y-3">
              <div v-for="item in order.orderItems" :key="item._id" class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <img 
                    :src="item.image ? `http://localhost:9001/uploads/${item.image}` : '/placeholder-product.png'" 
                    :alt="item.name"
                    class="h-16 w-16 rounded-lg object-cover bg-gray-100"
                  >
                </div>
                <div class="flex-grow">
                  <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                  <p class="text-sm text-gray-500">Jumlah: {{ item.quantity }} meter</p>
                  <p class="text-sm font-medium text-gray-900">Rp {{ formatCurrency(item.price) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Info -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 class="font-medium text-gray-900 mb-2">Alamat Pengiriman</h5>
                <p class="text-sm text-gray-600">
                  {{ order.shippingAddress.address }}<br>
                  {{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}<br>
                  {{ order.shippingAddress.country }}
                </p>
              </div>
              <div>
                <h5 class="font-medium text-gray-900 mb-2">Metode Pembayaran</h5>
                <p class="text-sm text-gray-600">{{ order.paymentMethod }}</p>
              
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              v-if="canCancelOrder(order.orderStatus)"
              @click="cancelOrder(order._id)"
              :disabled="cancellingOrderId === order._id"
              class="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
            >
              <svg v-if="cancellingOrderId === order._id" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ cancellingOrderId === order._id ? 'Membatalkan...' : 'Batalkan Pesanan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BE_PRE_URL from '../url'




// Reactive data
const orders = ref([])
const loading = ref(false)
const error = ref(null)
const cancellingOrderId = ref(null)

// Helper function untuk mendapatkan token dari localStorage
const getTokenFromLocalStorage = () => {
  try {
    const token = localStorage.getItem('jwt') || localStorage.getItem('token')
    return token
  } catch (err) {
    console.error('[Pemesanan] Error getting token from localStorage:', err)
    return null
  }
}

// Fetch orders dari backend
const fetchOrders = async () => {
  console.log('[Pemesanan] Starting to fetch user orders...')
  loading.value = true
  error.value = null

  try {
    // Dapatkan user_id dari localStorage
    const user_id = localStorage.getItem('user_id')
    const token = getTokenFromLocalStorage()
    
    if (!user_id) {
      console.error('[Pemesanan] No user_id found in localStorage')
      throw new Error('User ID tidak ditemukan. Silakan login kembali.')
    }

    if (!token) {
      console.error('[Pemesanan] No token found in localStorage')
      throw new Error('Token autentikasi tidak ditemukan. Silakan login kembali.')
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    // Menggunakan endpoint dengan params sesuai backend
    const url = `http://${BE_PRE_URL}/orders/user/${user_id}`
    console.log(`[Pemesanan] Sending GET request to: ${url}`)

    const { data } = await axios.get(url, config)
    orders.value = data.data
    console.log('[Pemesanan] Orders fetched successfully:', data)

  } catch (err) {
    console.error('[Pemesanan] Error fetching orders:', err)
    
    if (err.response) {
      console.error('[Pemesanan] Server Response Error:', err.response.data)
      console.error('[Pemesanan] Status:', err.response.status)
      error.value = err.response.data.message || 'Terjadi kesalahan saat mengambil data pesanan dari server.'

      if (err.response.status === 401) {
        alert('Sesi Anda telah berakhir. Harap login kembali.')
        localStorage.removeItem('user_id')
        localStorage.removeItem('jwt')
        localStorage.removeItem('token')
        
      }
    } else if (err.request) {
      console.error('[Pemesanan] Network Error:', err.request)
      error.value = 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
    } else {
      console.error('[Pemesanan] Error:', err.message)
      error.value = err.message || 'Terjadi kesalahan tidak terduga.'
    }
  } finally {
    loading.value = false
    console.log('[Pemesanan] Fetch process finished.')
  }
}

// Cancel order function
const cancelOrder = async (orderId) => {
  console.log(`[Pemesanan] Attempting to cancel order: ${orderId}`)
  
  if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
    return
  }

  cancellingOrderId.value = orderId

  try {
    const token = getTokenFromLocalStorage()
    
    if (!token) {
      throw new Error('Token autentikasi tidak ditemukan.')
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    // Menggunakan endpoint yang benar sesuai backend
    const url = `http://${BE_PRE_URL}/orders/${orderId}/cancel-customer`
    console.log(`[Pemesanan] Sending PUT request to: ${url}`)

    const { data } = await axios.put(url, {}, config)
    
    console.log('[Pemesanan] Order cancelled successfully:', data)
    
    // Update local state
    const orderIndex = orders.value.findIndex(order => order._id === orderId)
    if (orderIndex !== -1) {
      orders.value[orderIndex].orderStatus = 'Cancelled'
    }

    alert('Pesanan berhasil dibatalkan!')

  } catch (err) {
    console.error('[Pemesanan] Error cancelling order:', err)
    
    let errorMessage = 'Gagal membatalkan pesanan.'
    
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message
    } else if (err.message) {
      errorMessage = err.message
    }
    
    alert(errorMessage)
  } finally {
    cancellingOrderId.value = null
  }
}

// Helper functions
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'Pending Payment': 'bg-yellow-100 text-yellow-800',
    'Processing': 'bg-blue-100 text-blue-800',
    'Shipped': 'bg-purple-100 text-purple-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Refunded': 'bg-gray-100 text-gray-800',
    'Completed': 'bg-green-100 text-green-800',
  }
  return statusClasses[status] || 'bg-gray-100 text-gray-800'
}

const canCancelOrder = (status) => {
  return ['Pending Payment', 'Processing'].includes(status)
}

const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

// Component lifecycle
onMounted(() => {
  fetchOrders()
})
</script>