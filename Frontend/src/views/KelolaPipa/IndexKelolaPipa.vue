<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Kelola Pipa</h1>
        <p class="text-gray-600">Manajemen data pipa untuk sistem distribusi</p>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="flex flex-col items-center">
          <div class="loader mb-4"></div>
          <p class="text-gray-600">Memuat data pipa...</p>
        </div>
      </div>

      <div v-if="error" class="mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <p class="text-red-800 font-medium">{{ error }}</p>
          </div>
        </div>
      </div>

      <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center">
          <span class="text-sm text-gray-700">
            Total: <span class="font-medium">{{ pipes.length }}</span> pipa
          </span>
        </div>
        <div class="flex gap-3">
          <button
            @click="fetchPipes"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh
          </button>
          <router-link to="/tambah-pipa">
            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Tambah Pipa 
            </button>
          </router-link>
        </div>
      </div>

      <div v-if="!loading && !error" class="hidden lg:block">
        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pipa
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spesifikasi
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga & Stok
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="pipe in pipes" :key="pipe._id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-16 w-16">
                        <img v-if="pipe.imageUrl"
                             :src="pipe.imageUrl"
                             :alt="pipe.pipeName"
                             class="h-16 w-16 rounded-lg object-cover border border-gray-200">
                        <div v-else class="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ pipe.pipeName }}</div>
                        <div class="text-sm text-gray-500">{{ pipe.pipeType }}</div>
                        <div class="text-xs text-gray-400">{{ pipe.pipeClass }}</div>
                      </div>
                    </div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      <div class="mb-1">Ø {{ pipe.diameter }}mm</div>
                      <div class="text-gray-500">{{ pipe.length }}m × {{ pipe.wallThickness }}mm</div>
                      <div class="text-xs text-gray-400">{{ pipe.material }}</div>
                    </div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 font-medium">
                      Rp {{ pipe.pricePerMeter.toLocaleString('id-ID') }}
                    </div>
                    <div class="text-sm text-gray-500">per meter</div>
                    <div class="text-xs text-gray-400">Stok: {{ pipe.stock }}</div>
                  </td>

                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                      <div class="mb-1">Warna: {{ pipe.color }}</div>
                      <div class="text-xs text-gray-500">{{ formatDate(pipe.productionDate) }}</div>
                    </div>
                    <div v-if="pipe.description" class="text-xs text-gray-400 mt-1 max-w-xs truncate">
                      {{ pipe.description }}
                    </div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(pipe.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ pipe.status }}
                    </span>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center gap-2">
                      <router-link :to="`/update-pipa/${pipe._id}`">
                        <button class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                      </router-link>
                      <button @click="promptDelete(pipe._id, pipe.pipeName)" class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error" class="lg:hidden">
        <div class="space-y-4">
          <div v-for="pipe in pipes" :key="pipe._id" class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-start gap-4 mb-4">
              <div class="flex-shrink-0">
                <img v-if="pipe.imageUrl"
                     :src="pipe.imageUrl"
                     :alt="pipe.pipeName"
                     class="h-16 w-16 rounded-lg object-cover border border-gray-200">
                <div v-else class="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 truncate">{{ pipe.pipeName }}</h3>
                <p class="text-sm text-gray-500">{{ pipe.pipeType }} • {{ pipe.pipeClass }}</p>
                <span :class="getStatusClass(pipe.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1">
                  {{ pipe.status }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Diameter</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.diameter }}mm</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Panjang</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.length }}m</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Ketebalan</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.wallThickness }}mm</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Material</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.material }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Warna</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.color }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</dt>
                <dd class="text-sm text-gray-900 font-medium">{{ pipe.stock }}</dd>
              </div>
            </div>

            <div class="mb-4">
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Harga per Meter</dt>
              <dd class="text-lg font-bold text-gray-900">Rp {{ pipe.pricePerMeter.toLocaleString('id-ID') }}</dd>
            </div>

            <div v-if="pipe.description" class="mb-4">
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</dt>
              <dd class="text-sm text-gray-700 mt-1">{{ pipe.description }}</dd>
            </div>

            <div class="mb-4">
              <dt class="text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Produksi</dt>
              <dd class="text-sm text-gray-700">{{ formatDate(pipe.productionDate) }}</dd>
            </div>

            <div class="flex gap-2 pt-4 border-t border-gray-200">
              <router-link :to="`/update-pipa/${pipe._id}`" class="flex-1">
                <button class="w-full inline-flex justify-center items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit
                </button>
              </router-link>
              <button @click="promptDelete(pipe._id, pipe.pipeName)" class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error && pipes.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data pipa</h3>
        <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan pipa pertama Anda.</p>
        <div class="mt-6">
          <router-link to="/tambah-pipa">
            <button class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Tambah Pipa
            </button>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Hapus Pipa
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Apakah Anda yakin ingin menghapus pipa **"{{ pipeToDeleteName }}"**? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button type="button" @click="confirmDelete" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              Hapus
            </button>
            <button type="button" @click="cancelDelete" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
              Batal
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
import BE_PRE_URL from '../../url' // Pastikan path ini benar

const loading = ref(true)
const error = ref(null)
const pipes = ref([])

// State untuk modal konfirmasi delete
const showDeleteModal = ref(false)
const pipeToDeleteId = ref(null)
const pipeToDeleteName = ref('')

// Fetch Pipa Data
const fetchPipes = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await axios.get(`http://${BE_PRE_URL}/pipa`)
    pipes.value = response.data.data || response.data || []
  } catch (err) {
    error.value = "Gagal memuat data pipa. Silakan coba lagi nanti."
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
  }
}

// Menampilkan modal konfirmasi delete
const promptDelete = (id, name) => {
  pipeToDeleteId.value = id
  pipeToDeleteName.value = name
  showDeleteModal.value = true
}

// Logika penghapusan setelah konfirmasi
const confirmDelete = async () => {
  try {
    await axios.delete(`http://${BE_PRE_URL}/pipa/${pipeToDeleteId.value}`)
    // Refresh list pipa
    pipes.value = pipes.value.filter(pipe => pipe._id !== pipeToDeleteId.value)
    // Sembunyikan modal
    showDeleteModal.value = false
    pipeToDeleteId.value = null
    pipeToDeleteName.value = ''
    // Anda bisa menambahkan notifikasi sukses di sini jika diinginkan
    // Contoh: alert('Pipa berhasil dihapus!');
  } catch (err) {
    alert("Gagal menghapus pipa. Silakan coba lagi.");
    console.error('Delete error:', err);
  }
}

// Membatalkan penghapusan
const cancelDelete = () => {
  showDeleteModal.value = false
  pipeToDeleteId.value = null
  pipeToDeleteName.value = ''
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get status class for styling
const getStatusClass = (status) => {
  switch (status) {
    case 'Aktif':
      return 'bg-green-100 text-green-800'
    case 'Tidak Aktif':
      return 'bg-red-100 text-red-800'
    case 'Habis Stok':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Ambil data pipa ketika komponen dimuat
onMounted(() => {
  fetchPipes()
})
</script>

<style scoped>
.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>