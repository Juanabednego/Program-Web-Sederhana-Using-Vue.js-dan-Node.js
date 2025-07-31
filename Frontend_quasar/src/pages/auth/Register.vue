<!-- src/pages/Register.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <q-card class="q-pa-lg shadow-lg rounded-borders" style="width: 100%; max-width: 450px;">
      <q-card-section>
        <div class="text-h5 text-weight-bold text-grey-9 q-mb-md text-center">Registrasi</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleRegister" class="q-gutter-md">
          <!-- Username -->
          <q-input
            filled
            v-model="form.username"
            label="Username"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Username tidak boleh kosong']"
            placeholder="Masukkan username"
          />

          <!-- Email -->
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
            placeholder="Masukkan email"
          />

          <!-- Nama Lengkap -->
          <q-input
            filled
            v-model="form.name"
            label="Nama Lengkap"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Nama lengkap tidak boleh kosong']"
            placeholder="Masukkan nama lengkap"
          />

          <!-- Password -->
          <q-input
            filled
            v-model="form.password"
            label="Password"
            type="password"
            lazy-rules
            :rules="[val => (val && val.length > 0) || 'Password tidak boleh kosong']"
            placeholder="Masukkan password"
          />

          <div class="flex justify-center q-mt-lg">
            <q-btn
              type="submit"
              color="primary"
              :label="isLoading ? 'Mendaftarkan...' : 'Registrasi'"
              :loading="isLoading"
              :disable="isLoading"
              class="full-width q-py-md"
              unelevated
            />
          </div>

          <div class="text-center q-mt-md">
            Sudah punya akun?
            <router-link to="/" class="text-blue-8 text-weight-medium">Login di sini</router-link>
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
import { useQuasar } from 'quasar'; 


import BE_PRE_URL from 'src/url/index.js';

const router = useRouter();
const $q = useQuasar();

const isLoading = ref(false);

const form = reactive({
  username: '',
  email: '',
  name: '', 
  password: ''
});

const handleRegister = async () => {
 
  $q.notify({ group: false });

  
  if (!form.username || !form.email || !form.name || !form.password) {
    $q.notify({
      type: 'warning',
      message: 'Semua field harus diisi.',
      position: 'top',
      timeout: 2000
    });
    return; 
  }

  isLoading.value = true;

  try {
    const response = await axios.post(`http://${BE_PRE_URL}/auth/register`, {
      username: form.username,
      email: form.email,
      nama: form.name,
      password: form.password
    });

    console.log('Registrasi berhasil:', response.data);

    $q.notify({
      type: 'positive',
      message: 'Registrasi berhasil! Silakan login.',
      position: 'top',
      timeout: 2000
    });

    // Arahkan ke halaman login
    router.push('/');

  } catch (error) {
    console.error('Error saat registrasi:', error);

    let errorMessage = 'Terjadi kesalahan saat registrasi.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>

</style>
