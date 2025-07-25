<!-- src/pages/UpdateUser.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <q-card class="q-pa-lg shadow-lg rounded-borders" style="width: 100%; max-width: 500px;">
      <q-card-section>
        <div class="text-h5 text-weight-bold text-grey-9 q-mb-md text-center">Update User</div>
      </q-card-section>

      <!-- Loading State -->
      <q-card-section v-if="isLoading" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
        <div class="text-h6 text-grey-7">Memuat data pengguna...</div>
      </q-card-section>

      <!-- Form Update User -->
      <q-card-section v-else>
        <q-form @submit.prevent="handleUpdate" class="q-gutter-md">
          <q-input
            filled
            v-model="form.username"
            label="Username"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Username tidak boleh kosong']"
          />

          <q-input
            filled
            v-model="form.email"
            label="Email"
            type="email"
            lazy-rules
            :rules="[
              val => (val && val.length > 0) || 'Email tidak boleh kosong',
              val => /.+@.+\..+/.test(val) || 'Email tidak valid'
            ]"
          />

          <q-input
            filled
            v-model="form.nama"
            label="Nama"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Nama tidak boleh kosong']"
          />

          <q-input
            filled
            v-model="form.password"
            label="Password"
            type="password"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Password tidak boleh kosong']"
          />

          <div class="flex justify-between q-mt-lg">
            <q-btn
              label="Kembali"
              color="grey-7"
              text-color="dark"
              @click="goBack"
              unelevated
            />
            <q-btn
              type="submit"
              color="primary"
              :label="isUpdating ? 'Updating...' : 'Update'"
              :loading="isUpdating"
              :disable="isUpdating"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { reactive, onMounted, ref } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js';

const route = useRoute();
const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance

const isLoading = ref(true);
const isUpdating = ref(false);

const form = reactive({
  username: '',
  email: '',
  nama: '',
  password: ''
});

const userId = ref('');

const fetchUserById = async (id) => {
  isLoading.value = true;
  try {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('Token autentikasi tidak ditemukan. Silakan login kembali.');
    }
    const res = await axios.get(`http://${BE_PRE_URL}/auth/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const user = res.data.data;
    form.username = user.username;
    form.email = user.email;
    form.nama = user.nama;
    form.password = user.password; // Note: Mengisi password langsung bisa jadi isu keamanan. Biasanya, ini tidak dilakukan.
    userId.value = user._id;
  } catch (err) {
    console.error('Gagal mengambil data user:', err);
    let errorMessage = 'Gagal mengambil data user.';
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
    router.push('/dashboard'); // Atau halaman yang sesuai setelah error
  } finally {
    isLoading.value = false;
  }
};

const handleUpdate = async () => {
  isUpdating.value = true;
  try {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('Token autentikasi tidak ditemukan. Silakan login kembali.');
    }

    const payload = {
      username: form.username,
      email: form.email,
      nama: form.nama,
      password: form.password,
      user_id: userId.value // Pastikan user_id dikirim jika diperlukan oleh backend
    };

    await axios.patch(`http://${BE_PRE_URL}/auth/update`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    $q.notify({
      type: 'positive',
      message: 'Data user berhasil diperbarui!',
      position: 'top',
      timeout: 2000
    });
    router.push('/dashboard'); // Redirect ke halaman dashboard setelah sukses
  } catch (err) {
    console.error('Gagal update user:', err);
    let errorMessage = 'Gagal update user.';
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
  } finally {
    isUpdating.value = false;
  }
};

const goBack = () => {
  router.back(); // Kembali ke halaman sebelumnya
};

onMounted(() => {
  const id = route.params.id;
  if (id) {
    fetchUserById(id);
  } else {
    $q.notify({
      type: 'negative',
      message: 'ID pengguna tidak ditemukan di URL.',
      position: 'top',
      timeout: 3000
    });
    router.push('/dashboard'); // Redirect jika ID tidak ada
  }
});
</script>

<style scoped>
/* Tidak perlu lagi gaya kustom untuk input:focus karena Quasar menanganinya */
</style>
