<!-- src/pages/auth/Login.vue -->
<template>
  <!-- q-page sebagai pembungkus utama untuk halaman, dengan utilitas flexbox Quasar -->
  <q-page class="flex flex-center bg-grey-2">
    <!-- q-card sebagai pengganti div dengan shadow dan rounded-lg -->
    <q-card class="q-pa-md shadow-2 my_card" style="width: 100%; max-width: 400px;">
      <q-card-section>
        <div class="text-h6 text-center text-grey-8 q-mb-md">Login</div>
      </q-card-section>

      <!-- q-form sebagai pengganti form HTML -->
      <q-form @submit.prevent="handleLogin" class="q-gutter-md">
        <!-- q-input sebagai pengganti input HTML untuk username -->
        <q-input
          filled
          v-model="username"
          label="Username"
          lazy-rules
          :rules="[val => (val && val.length > 0) || 'Username tidak boleh kosong']"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <!-- q-input sebagai pengganti input HTML untuk password -->
        <q-input
          filled
          v-model="password"
          label="Password"
          type="password"
          lazy-rules
          :rules="[val => (val && val.length > 0) || 'Password tidak boleh kosong']"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <!-- Menampilkan error message menggunakan q-banner atau div sederhana -->
        <div v-if="errorMessage" class="text-red-7 text-center q-mt-sm">
          {{ errorMessage }}
        </div>

        <div class="q-mt-md">
          <!-- q-btn sebagai pengganti button HTML untuk Login -->
          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="full-width q-mb-sm"
            :loading="isLoading"
            :disable="isLoading"
          />

          <!-- q-btn sebagai pengganti button HTML untuk Registrasi -->
          <q-btn
            label="Registrasi"
            type="button"
            color="grey-6"
            text-color="dark"
            class="full-width"
            @click="goToRegister"
          />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi

// Pastikan file src/url/index.js Anda mengekspor BE_PRE_URL sebagai default export.
// Contoh isi src/url/index.js:
// const BE_PRE_URL = 'localhost:3000'; // Ganti dengan URL backend Anda yang sebenarnya
// export default BE_PRE_URL;
import BE_PRE_URL from 'src/url/index.js';

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance untuk notifikasi

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post(`http://${BE_PRE_URL}/auth/login`, {
      username: username.value,
      password: password.value,
    });

    const { data, jwt, role, user_id } = response.data;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('role', role);
    localStorage.setItem('user_id', user_id);
    localStorage.setItem('userData', JSON.stringify(data));

    if (localStorage.getItem('logout')) {
      localStorage.removeItem('logout');
    }

    // Tampilkan notifikasi sukses
    $q.notify({
      type: 'positive',
      message: 'Login berhasil!',
      position: 'top',
      timeout: 2000
    });

    // Navigasi berdasarkan role
    if (role === 'admin') {
      router.push('/dashboard');
      window.location.reload(); // Refresh paksa setelah login admin (sesuai kode asli)
    } else if (role === 'customer') {
      router.push('/home'); // Navigasi ke halaman customer
      window.location.reload(); // Refresh paksa setelah login customer (sesuai kode asli)
    }
  } catch (error) {
    isLoading.value = false; // Pastikan isLoading diatur kembali di sini juga

    let message = 'Terjadi kesalahan saat login.';
    if (error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    errorMessage.value = message; // Tetap simpan di errorMessage untuk tampilan di bawah form
    $q.notify({
      type: 'negative',
      message: message,
      position: 'top',
      timeout: 3000
    });
  } finally {
    isLoading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
/* Anda bisa menambahkan gaya kustom di sini jika diperlukan,
   tapi sebagian besar styling sudah ditangani oleh kelas utilitas Quasar. */
.my_card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* Replikasi shadow-lg Tailwind */
}
</style>
