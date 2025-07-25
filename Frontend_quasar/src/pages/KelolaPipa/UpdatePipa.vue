<!-- src/pages/UpdatePipe.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <q-card class="q-pa-lg shadow-lg rounded-borders" style="width: 100%; max-width: 800px;">
      <q-card-section>
        <div class="text-h4 text-weight-bold text-grey-9 q-mb-md text-center">Update Pipa</div>
      </q-card-section>

      <!-- Loading State -->
      <q-card-section v-if="loading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
        <div class="text-h6 text-grey-7">Memuat data pipa...</div>
      </q-card-section>

      <!-- Error State -->
      <q-card-section v-else-if="error" class="q-py-xl">
        <q-banner class="bg-red-1 text-red-8 rounded-borders q-pa-md">
          <template v-slot:avatar>
            <q-icon name="error" color="red-4" />
          </template>
          <div class="text-body1 text-weight-bold">{{ error }}</div>
        </q-banner>
      </q-card-section>

      <!-- Form Update Pipa -->
      <q-card-section v-else>
        <q-form @submit.prevent="promptForUpdate" class="q-gutter-md">
          <q-input
            filled
            v-model="pipeData.pipeName"
            label="Nama Pipa *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Nama Pipa tidak boleh kosong']"
            placeholder="Masukkan nama pipa"
          />

          <q-select
            filled
            v-model="pipeData.pipeType"
            :options="['PVC', 'HDPE', 'PPR', 'Besi', 'Lainnya']"
            label="Jenis Pipa *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Jenis Pipa tidak boleh kosong']"
            placeholder="Pilih jenis pipa"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="pipeData.diameter"
                label="Diameter (mm) *"
                type="number"
                min="1"
                max="1000"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val > 0) || 'Diameter harus angka positif']"
                placeholder="Masukkan diameter"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="pipeData.length"
                label="Panjang (m) *"
                type="number"
                min="1"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val > 0) || 'Panjang harus angka positif']"
                placeholder="Masukkan panjang"
              />
            </div>
          </div>

          <q-input
            filled
            v-model.number="pipeData.wallThickness"
            label="Ketebalan Dinding (mm) *"
            type="number"
            min="1"
            lazy-rules
            :rules="[val => (val !== null && val !== '' && val > 0) || 'Ketebalan dinding harus angka positif']"
            placeholder="Masukkan ketebalan dinding"
          />

          <q-select
            filled
            v-model="pipeData.pipeClass"
            :options="['Class A', 'Class B', 'Class C']"
            label="Kelas Pipa *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Kelas Pipa tidak boleh kosong']"
            placeholder="Pilih kelas pipa"
          />

          <q-input
            filled
            v-model="pipeData.material"
            label="Material *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Material tidak boleh kosong']"
            placeholder="Masukkan material pipa"
          />

          <q-input
            filled
            v-model="pipeData.color"
            label="Warna *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Warna tidak boleh kosong']"
            placeholder="Masukkan warna pipa"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="pipeData.pricePerMeter"
                label="Harga per Meter (Rp) *"
                type="number"
                min="0"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val >= 0) || 'Harga harus angka non-negatif']"
                placeholder="Masukkan harga per meter"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="pipeData.stock"
                label="Stok *"
                type="number"
                min="0"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val >= 0) || 'Stok harus angka non-negatif']"
                placeholder="Masukkan jumlah stok"
              />
            </div>
          </div>

          <q-input
            filled
            v-model="pipeData.productionDate"
            label="Tanggal Produksi *"
            type="date"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Tanggal Produksi tidak boleh kosong']"
          />

          <q-select
            filled
            v-model="pipeData.status"
            :options="['Aktif', 'Tidak Aktif', 'Habis Stok']"
            label="Status"
          />

          <!-- Current Image Display -->
          <div v-if="pipeData.imageUrl">
            <div class="text-subtitle1 text-grey-7 q-mb-sm">Gambar Saat Ini</div>
            <q-img :src="pipeData.imageUrl" alt="Current pipe image"
                   class="rounded-borders shadow-1"
                   style="width: 128px; height: 128px; object-fit: cover;"
                   no-native-menu
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-negative text-white">
                  Gagal memuat gambar
                </div>
              </template>
            </q-img>
          </div>

          <!-- File Input for New Image -->
          <q-file
            filled
            v-model="selectedFile"
            label="Ganti Gambar Pipa"
            accept="image/jpeg,image/png,image/jpg"
            max-file-size="5242880"
            @update:model-value="handleFileChange"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <p class="text-caption text-grey-7 q-mt-xs">Format: JPG, PNG. Maksimal 5MB. Kosongkan jika tidak ingin mengganti gambar.</p>
          </q-file>

          <!-- Image Preview -->
          <div v-if="imagePreview" class="q-mt-md">
            <div class="text-subtitle1 text-grey-7 q-mb-sm">Preview Gambar Baru</div>
            <q-img :src="imagePreview" alt="Preview"
                   class="rounded-borders shadow-1"
                   style="width: 128px; height: 128px; object-fit: cover;"
                   no-native-menu
            />
          </div>

          <q-input
            filled
            v-model="pipeData.description"
            label="Deskripsi"
            type="textarea"
            rows="3"
            placeholder="Masukkan deskripsi pipa (opsional)"
          />

          <div class="flex justify-end q-gutter-md q-pt-md">
            <q-btn
              label="Batal"
              color="grey-7"
              text-color="dark"
              @click="router.push('/kelola-pipa')"
              unelevated
            />
            <q-btn
              type="submit"
              color="primary"
              :label="updateLoading ? 'Memperbarui...' : 'Update'"
              :loading="updateLoading"
              :disable="updateLoading"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js';

const route = useRoute();
const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance

// Reactive states
const loading = ref(true); // Untuk loading data awal pipa
const updateLoading = ref(false); // Untuk loading saat proses update
const error = ref(null);
const imagePreview = ref(null);
const selectedFile = ref(null);

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
  imageUrl: '' // Untuk menyimpan URL gambar yang ada saat ini
});

const handleFileChange = (file) => { // q-file v-model langsung memberikan objek File
  error.value = null; // Clear general error message
  selectedFile.value = file; // file object from q-file

  if (file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      $q.notify({
        type: 'negative',
        message: 'File harus berupa gambar (JPG, PNG).',
        position: 'top',
        timeout: 3000
      });
      selectedFile.value = null;
      imagePreview.value = null;
      return;
    }

    if (file.size > maxFileSize) {
      $q.notify({
        type: 'negative',
        message: `Ukuran file maksimal 5MB. File Anda ${Math.round(file.size / 1024 / 1024)}MB.`,
        position: 'top',
        timeout: 3000
      });
      selectedFile.value = null;
      imagePreview.value = null;
      return;
    }

    // Buat preview gambar
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = null;
  }
};


const uploadImage = async () => {
  if (!selectedFile.value) return null;

  try {
    const uploadFormData = new FormData();
    uploadFormData.append('image', selectedFile.value);

    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ganti dengan endpoint upload gambar Anda yang sebenarnya
    const response = await axios.post(`http://${BE_PRE_URL}/lapangan/file-upload`, uploadFormData, config);

    return response.data.url;
  } catch (err) {
    console.error('Upload error:', err);
    $q.notify({
      type: 'negative',
      message: 'Gagal mengupload gambar: ' + (err.response?.data?.message || err.message),
      position: 'top',
      timeout: 3000
    });
    throw new Error('Gagal mengupload gambar'); // Re-throw untuk ditangkap di confirmUpdate
  }
};

// Fetch data pipa berdasarkan ID yang diterima dari URL
const fetchPipe = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`http://${BE_PRE_URL}/pipa/${route.params.id}`);

    const pipeDataResponse = response.data;
    if (pipeDataResponse.productionDate) {
      const date = new Date(pipeDataResponse.productionDate);
      pipeDataResponse.productionDate = date.toISOString().split('T')[0];
    }

    pipeData.value = pipeDataResponse;
  } catch (err) {
    console.error('Fetch error:', err);
    error.value = 'Gagal memuat data pipa. Silakan coba lagi nanti.';
    $q.notify({
      type: 'negative',
      message: error.value,
      position: 'top',
      timeout: 3000
    });
  } finally {
    loading.value = false;
  }
};

// --- Metode Baru untuk Konfirmasi Update ---
const promptForUpdate = () => {
  $q.dialog({
    title: 'Konfirmasi Perubahan Data',
    message: 'Anda yakin ingin menyimpan perubahan pada data pipa ini?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    confirmUpdate(); // Lanjutkan ke fungsi update jika dikonfirmasi
  }).onCancel(() => {
    // Tidak ada aksi khusus jika dibatalkan, form tetap terbuka
    $q.notify({
      type: 'info',
      message: 'Penyimpanan perubahan dibatalkan.',
      position: 'top',
      timeout: 1500
    });
  });
};

const confirmUpdate = async () => {
  updateLoading.value = true;
  error.value = null; // Clear previous error

  try {
    const updatePayload = { ...pipeData.value };

    // Jika ada file baru dipilih, upload dan update imageUrl di payload
    if (selectedFile.value) {
      const newImageUrl = await uploadImage();
      updatePayload.imageUrl = newImageUrl;
    }
    // Jika tidak ada file baru dan imageUrl di pipeData.value kosong,
    // maka hapus imageUrl dari payload agar tidak mengirim string kosong
    else if (!pipeData.value.imageUrl) {
      delete updatePayload.imageUrl;
    }


    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.put(`http://${BE_PRE_URL}/pipa/${route.params.id}`, updatePayload, config);

    $q.notify({
      type: 'positive',
      message: response.data.message || 'Pipa berhasil diperbarui!',
      position: 'top',
      timeout: 2000
    });

    // Reset preview dan selected file
    imagePreview.value = null;
    selectedFile.value = null;

    // Redirect ke halaman kelola pipa
    setTimeout(() => {
      router.push('/kelola-pipa');
    }, 1000);

  } catch (err) {
    console.error('Update error:', err);
    let errorMessage = 'Gagal memperbarui pipa. Silakan coba lagi.';
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    error.value = errorMessage; // Set error.value di sini
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });
  } finally {
    updateLoading.value = false;
  }
};
// --- Akhir Metode Baru ---

// Ambil data pipa saat halaman dimuat
onMounted(() => {
  fetchPipe();
});
</script>

<style scoped>
/*
  Tidak perlu lagi gaya loader kustom karena menggunakan q-spinner.
  Gaya untuk input dan select juga ditangani oleh komponen Quasar.
*/
</style>
