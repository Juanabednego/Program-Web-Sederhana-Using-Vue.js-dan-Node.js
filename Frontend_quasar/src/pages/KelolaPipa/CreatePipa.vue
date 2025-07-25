<!-- src/pages/AddPipe.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <q-card class="q-pa-lg shadow-lg rounded-borders" style="width: 100%; max-width: 800px;">
      <q-card-section>
        <div class="text-h4 text-weight-bold text-grey-9 q-mb-md text-center">Tambah Pipa Baru</div>
      </q-card-section>

      <!-- Form -->
      <q-card-section>
        <q-form @submit.prevent="createPipa" class="q-gutter-md">
          <!-- Nama Pipa -->
          <q-input
            filled
            v-model="formData.pipeName"
            label="Nama Pipa *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Nama Pipa tidak boleh kosong']"
            placeholder="Masukkan nama pipa"
          />

          <!-- Jenis Pipa -->
          <q-select
            filled
            v-model="formData.pipeType"
            :options="['PVC', 'HDPE', 'PPR', 'Besi', 'Lainnya']"
            label="Jenis Pipa *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Jenis Pipa tidak boleh kosong']"
            placeholder="Pilih jenis pipa"
          />

          <!-- Row untuk Diameter dan Panjang -->
          <div class="row q-col-gutter-md">
            <!-- Diameter -->
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="formData.diameter"
                label="Diameter (mm) *"
                type="number"
                min="1"
                max="1000"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val > 0) || 'Diameter harus angka positif']"
                placeholder="Masukkan diameter"
              />
            </div>

            <!-- Panjang -->
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="formData.length"
                label="Panjang (m) *"
                type="number"
                min="1"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val > 0) || 'Panjang harus angka positif']"
                placeholder="Masukkan panjang"
              />
            </div>
          </div>

          <!-- Ketebalan Dinding -->
          <q-input
            filled
            v-model.number="formData.wallThickness"
            label="Ketebalan Dinding (mm) *"
            type="number"
            min="1"
            lazy-rules
            :rules="[val => (val !== null && val !== '' && val > 0) || 'Ketebalan dinding harus angka positif']"
            placeholder="Masukkan ketebalan dinding"
          />

          <!-- Kelas Pipa -->
          <q-select
            filled
            v-model="formData.pipeClass"
            :options="['Class A', 'Class B', 'Class C']"
            label="Kelas Pipa *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Kelas Pipa tidak boleh kosong']"
            placeholder="Pilih kelas pipa"
          />

          <!-- Material -->
          <q-input
            filled
            v-model="formData.material"
            label="Material *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Material tidak boleh kosong']"
            placeholder="Masukkan material pipa"
          />

          <!-- Warna -->
          <q-input
            filled
            v-model="formData.color"
            label="Warna *"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Warna tidak boleh kosong']"
            placeholder="Masukkan warna pipa"
          />

          <!-- Row untuk Harga dan Stok -->
          <div class="row q-col-gutter-md">
            <!-- Harga per Meter -->
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="formData.pricePerMeter"
                label="Harga per Meter (Rp) *"
                type="number"
                min="0"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val >= 0) || 'Harga harus angka non-negatif']"
                placeholder="Masukkan harga per meter"
              />
            </div>

            <!-- Stok -->
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model.number="formData.stock"
                label="Stok *"
                type="number"
                min="0"
                lazy-rules
                :rules="[val => (val !== null && val !== '' && val >= 0) || 'Stok harus angka non-negatif']"
                placeholder="Masukkan jumlah stok"
              />
            </div>
          </div>

          <!-- Tanggal Produksi -->
          <q-input
            filled
            v-model="formData.productionDate"
            label="Tanggal Produksi *"
            type="date"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Tanggal Produksi tidak boleh kosong']"
          />

          <!-- Upload Gambar -->
          <q-file
            filled
            v-model="selectedFile"
            label="Gambar Pipa"
            accept="image/jpeg,image/png,image/jpg"
            max-file-size="5242880"
            @update:model-value="handleFileChange"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <p class="text-caption text-grey-7 q-mt-xs">Format: JPG, PNG. Maksimal 5MB</p>
          </q-file>

          <!-- Preview Gambar -->
          <div v-if="imagePreview" class="q-mt-md">
            <div class="text-subtitle1 text-grey-7 q-mb-sm">Preview Gambar</div>
            <q-img :src="imagePreview" alt="Preview"
                   class="rounded-borders shadow-1"
                   style="width: 128px; height: 128px; object-fit: cover;"
                   no-native-menu
            />
          </div>

          <!-- Deskripsi -->
          <q-input
            filled
            v-model="formData.description"
            label="Deskripsi"
            type="textarea"
            rows="3"
            placeholder="Masukkan deskripsi pipa (opsional)"
          />

          <!-- Buttons -->
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
              color="positive"
              :label="loading ? 'Menyimpan...' : 'Simpan'"
              :loading="loading"
              :disable="loading"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js';

const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance

// Reactive states
const loading = ref(false);
const imagePreview = ref(null);
const selectedFile = ref(null);

// Form data
const formData = reactive({
  pipeName: '',
  pipeType: '',
  diameter: null, // Ubah ke null untuk input number agar validasi Quasar bekerja lebih baik
  length: null,
  wallThickness: null,
  pipeClass: '',
  material: '',
  color: '',
  pricePerMeter: null,
  stock: null,
  productionDate: '',
  description: '',
  imageUrl: '' // Akan diisi setelah upload gambar
});

// Handle file change untuk preview gambar
const handleFileChange = (file) => { // q-file v-model langsung memberikan objek File
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = null;
  }
};

// Upload gambar
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
    throw new Error('Gagal mengupload gambar'); // Re-throw untuk ditangkap di createPipa
  }
};

// Create pipa function
const createPipa = async () => {
  loading.value = true;
  // Clear previous notifications
  $q.notify({ group: false });

  try {
    // Upload gambar jika ada
    if (selectedFile.value) {
      const imageUrl = await uploadImage();
      formData.imageUrl = imageUrl;
    } else {
      // Jika tidak ada gambar diupload, pastikan imageUrl di formData kosong
      formData.imageUrl = '';
    }

    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      $q.notify({
        type: 'negative',
        message: 'Anda tidak memiliki otorisasi. Silakan login kembali.',
        position: 'top',
        timeout: 3000
      });
      router.push({ name: 'Login' }); // Redirect ke halaman login
      return;
    }

    // Kirim data ke backend
    const response = await axios.post(`http://${BE_PRE_URL}/pipa`, formData, config);

    $q.notify({
      type: 'positive',
      message: response.data.message || 'Pipa berhasil dibuat!',
      position: 'top',
      timeout: 2000
    });

    // Reset form
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        formData[key] = '';
      } else if (typeof formData[key] === 'number') {
        formData[key] = null; // Set number fields to null for q-input
      }
    });
    imagePreview.value = null;
    selectedFile.value = null;

    // Redirect ke halaman kelola pipa setelah 1 detik
    setTimeout(() => {
      router.push('/kelola-pipa');
    }, 1000);

  } catch (err) {
    console.error('Create pipa error:', err);
    let errorMessage = 'Terjadi kesalahan saat membuat pipa.';
    if (err.response?.data?.message) {
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
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Tidak perlu lagi gaya loader kustom karena menggunakan q-spinner.
   Gaya untuk input dan select juga ditangani oleh komponen Quasar. */
</style>
