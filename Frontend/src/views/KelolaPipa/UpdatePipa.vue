<template>
  <div class="container mx-auto mt-8 max-w-2xl">
    <div class="bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Update Pipa</h2>

      <div v-if="loading" class="text-center mb-4">
        <span class="loader">Loading data pipa...</span>
      </div>

      <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{{ error }}</p>
      </div>

      <div v-if="success" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        <p>{{ success }}</p>
      </div>

      <form v-if="!loading && !error" @submit.prevent="promptForUpdate" class="space-y-4">
        <div>
          <label for="pipeName" class="block text-sm font-medium text-gray-700">Nama Pipa *</label>
          <input
            v-model="pipeData.pipeName"
            type="text"
            id="pipeName"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama pipa"
          />
        </div>

        <div>
          <label for="pipeType" class="block text-sm font-medium text-gray-700">Jenis Pipa *</label>
          <select
            v-model="pipeData.pipeType"
            id="pipeType"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih jenis pipa</option>
            <option value="PVC">PVC</option>
            <option value="HDPE">HDPE</option>
            <option value="PPR">PPR</option>
            <option value="Besi">Besi</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="diameter" class="block text-sm font-medium text-gray-700">Diameter (mm) *</label>
            <input
              v-model.number="pipeData.diameter"
              type="number"
              id="diameter"
              required
              min="1"
              max="1000"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan diameter"
            />
          </div>

          <div>
            <label for="length" class="block text-sm font-medium text-gray-700">Panjang (m) *</label>
            <input
              v-model.number="pipeData.length"
              type="number"
              id="length"
              required
              min="1"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan panjang"
            />
          </div>
        </div>

        <div>
          <label for="wallThickness" class="block text-sm font-medium text-gray-700">Ketebalan Dinding (mm) *</label>
          <input
            v-model.number="pipeData.wallThickness"
            type="number"
            id="wallThickness"
            required
            min="1"
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan ketebalan dinding"
          />
        </div>

        <div>
          <label for="pipeClass" class="block text-sm font-medium text-gray-700">Kelas Pipa *</label>
          <select
            v-model="pipeData.pipeClass"
            id="pipeClass"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih kelas pipa</option>
            <option value="Class A">Class A</option>
            <option value="Class B">Class B</option>
            <option value="Class C">Class C</option>
          </select>
        </div>

        <div>
          <label for="material" class="block text-sm font-medium text-gray-700">Material *</label>
          <input
            v-model="pipeData.material"
            type="text"
            id="material"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan material pipa"
          />
        </div>

        <div>
          <label for="color" class="block text-sm font-medium text-gray-700">Warna *</label>
          <input
            v-model="pipeData.color"
            type="text"
            id="color"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan warna pipa"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="pricePerMeter" class="block text-sm font-medium text-gray-700">Harga per Meter (Rp) *</label>
            <input
              v-model.number="pipeData.pricePerMeter"
              type="number"
              id="pricePerMeter"
              required
              min="0"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan harga per meter"
            />
          </div>

          <div>
            <label for="stock" class="block text-sm font-medium text-gray-700">Stok *</label>
            <input
              v-model.number="pipeData.stock"
              type="number"
              id="stock"
              required
              min="0"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan jumlah stok"
            />
          </div>
        </div>

        <div>
          <label for="productionDate" class="block text-sm font-medium text-gray-700">Tanggal Produksi *</label>
          <input
            v-model="pipeData.productionDate"
            type="date"
            id="productionDate"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select
            v-model="pipeData.status"
            id="status"
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
            <option value="Habis Stok">Habis Stok</option>
          </select>
        </div>

        <div v-if="pipeData.imageUrl" class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Gambar Saat Ini</label>
          <img :src="pipeData.imageUrl" alt="Current pipe image" class="w-32 h-32 object-cover rounded-md border mt-2">
        </div>

        <div>
          <label for="imageFile" class="block text-sm font-medium text-gray-700">Ganti Gambar Pipa</label>
          <input
            type="file"
            id="imageFile"
            @change="handleFileChange"
            accept="image/jpeg,image/png,image/jpg"
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p class="text-sm text-gray-500 mt-1">Format: JPG, PNG. Maksimal 5MB. Kosongkan jika tidak ingin mengganti gambar.</p>
        </div>

        <div v-if="imagePreview" class="mt-2">
          <label class="block text-sm font-medium text-gray-700">Preview Gambar Baru</label>
          <img :src="imagePreview" alt="Preview" class="w-32 h-32 object-cover rounded-md border mt-2">
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            v-model="pipeData.description"
            id="description"
            rows="3"
            class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan deskripsi pipa (opsional)"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4 pt-4">
          <router-link to="/kelola-pipa">
            <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              Batal
            </button>
          </router-link>
          <button
            type="submit"
            :disabled="updateLoading"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ updateLoading ? 'Memperbarui...' : 'Update' }}
          </button>
        </div>
      </form>
    </div>

    <ConfirmModal
      :isVisible="showConfirmModalFlag"
      title="Konfirmasi Perubahan Data"
      message="Anda yakin ingin menyimpan perubahan pada data pipa ini?"
      @confirmed="confirmUpdate"
      @canceled="cancelUpdate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import BE_PRE_URL from '../../url' // Pastikan path ini benar
import ConfirmModal from '../../components/ConfirmModal.vue'; // Import komponen modal

const route = useRoute()
const router = useRouter()

// Reactive states
const loading = ref(true) // Untuk loading data awal pipa
const updateLoading = ref(false) // Untuk loading saat proses update
const error = ref(null)
const success = ref(null)
const imagePreview = ref(null)
const selectedFile = ref(null)
const showConfirmModalFlag = ref(false) // State baru untuk mengontrol modal

const pipeData = ref({
  pipeName: '',
  pipeType: '',
  diameter: 0,
  length: 0,
  wallThickness: 0,
  pipeClass: '',
  material: '',
  color: '',
  pricePerMeter: 0,
  stock: 0,
  productionDate: '',
  status: 'Aktif',
  description: '',
  imageUrl: ''
})

// Handle file change untuk preview gambar
const handleFileChange = (event) => {
  error.value = null; // Reset error saat file berubah
  const file = event.target.files[0]
  if (file) {
    // Validasi file
    if (!file.type.startsWith('image/')) {
      error.value = 'File harus berupa gambar.'
      selectedFile.value = null;
      imagePreview.value = null;
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      error.value = 'Ukuran file maksimal 5MB.'
      selectedFile.value = null;
      imagePreview.value = null;
      return
    }

    selectedFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    selectedFile.value = null;
    imagePreview.value = null;
  }
}

// Upload gambar ke Cloudinary
const uploadImage = async () => {
  if (!selectedFile.value) return null

  try {
    const uploadFormData = new FormData()
    uploadFormData.append('image', selectedFile.value)

    // Tambahkan token jika ada
    const token = localStorage.getItem('jwt')
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }

    // Tambahkan Authorization header jika token ada
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Ganti dengan endpoint upload gambar Anda yang sebenarnya
    const response = await axios.post(`http://${BE_PRE_URL}/lapangan/file-upload`, uploadFormData, config)

    return response.data.url
  } catch (err) {
    console.error('Upload error:', err)
    throw new Error('Gagal mengupload gambar: ' + (err.response?.data?.message || err.message))
  }
}

// Fetch data pipa berdasarkan ID yang diterima dari URL
const fetchPipe = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`http://${BE_PRE_URL}/pipa/${route.params.id}`)

    // Format tanggal untuk input date
    const pipeDataResponse = response.data
    if (pipeDataResponse.productionDate) {
      // Pastikan tanggal diformat ke 'YYYY-MM-DD'
      const date = new Date(pipeDataResponse.productionDate);
      pipeDataResponse.productionDate = date.toISOString().split('T')[0];
    }

    pipeData.value = pipeDataResponse
  } catch (err) {
    console.error('Fetch error:', err)
    error.value = 'Gagal memuat data pipa. Silakan coba lagi nanti.'
  } finally {
    loading.value = false
  }
}

// --- Metode Baru untuk Konfirmasi Update ---
const promptForUpdate = () => {
  // Hanya tampilkan modal jika form valid (opsional, tapi disarankan)
  // Anda bisa menambahkan validasi form di sini sebelum menampilkan modal
  // Misalnya, jika form HTML Anda sudah memiliki 'required',
  // browser akan mencegah submit jika ada field kosong.
  showConfirmModalFlag.value = true; // Tampilkan modal
}

const confirmUpdate = async () => {
  showConfirmModalFlag.value = false; // Sembunyikan modal setelah konfirmasi
  updateLoading.value = true; // Aktifkan loading untuk proses update
  error.value = null;
  success.value = null;

  try {
    // Buat copy dari data pipa
    const updatePayload = { ...pipeData.value };

    // Hapus imageUrl dari payload jika tidak ada file baru diupload dan imageUrl lama ingin dipertahankan
    // atau jika backend Anda menangani pembaruan gambar secara terpisah
    if (!selectedFile.value && !pipeData.value.imageUrl) {
        delete updatePayload.imageUrl; // Hapus jika tidak ada gambar sama sekali
    }


    // Upload gambar baru jika ada
    if (selectedFile.value) {
      const imageUrl = await uploadImage();
      updatePayload.imageUrl = imageUrl;
    }

    // Tambahkan token untuk update pipa
    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        'Content-Type': 'application/json' // Pastikan ini application/json untuk payload JSON
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Kirim data ke backend
    const response = await axios.put(`http://${BE_PRE_URL}/pipa/${route.params.id}`, updatePayload, config);

    success.value = response.data.message || 'Pipa berhasil diperbarui!';

    // Reset preview dan selected file
    imagePreview.value = null;
    selectedFile.value = null;

    // Reset file input
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
      fileInput.value = '';
    }

    // Redirect ke halaman kelola pipa setelah 1.5 detik
    setTimeout(() => {
      router.push('/kelola-pipa');
    }, 1000);

  } catch (err) {
    console.error('Update error:', err);
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'Gagal memperbarui pipa. Silakan coba lagi.';
    }
  } finally {
    updateLoading.value = false; // Nonaktifkan loading setelah proses update selesai
  }
}

const cancelUpdate = () => {
  showConfirmModalFlag.value = false; // Sembunyikan modal
  console.log('Penyimpanan perubahan dibatalkan.');
  // Tidak ada aksi lain yang perlu dilakukan, form tetap terbuka
}
// --- Akhir Metode Baru ---

// Ambil data pipa saat halaman dimuat
onMounted(() => {
  fetchPipe()
})
</script>

<style scoped>
/* Anda sudah memiliki gaya loader di sini, yang bagus */
.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Tambahan styling untuk memastikan elemen form berada dalam batasan yang benar */
.container {
  padding: 1rem; /* Tambahkan sedikit padding di container utama */
}

/* Sesuaikan gaya input dan select agar konsisten dengan Tailwind/desain Anda */
/* Pastikan warna fokus cocok dengan skema warna Anda */
input:focus, select:focus, textarea:focus {
  border-color: #3b82f6; /* Contoh warna biru Tailwind */
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>