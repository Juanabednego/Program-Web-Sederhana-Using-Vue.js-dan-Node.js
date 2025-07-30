<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-md shadow-2 my_card" style="width: 100%; max-width: 400px;">
      <q-card-section>
        <div class="text-h6 text-center text-grey-8 q-mb-md">Login</div>
      </q-card-section>


      <q-form @submit.prevent="handleLogin" class="q-gutter-md">
      
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

       
        <div v-if="errorMessage" class="text-red-7 text-center q-mt-sm">
          {{ errorMessage }}
        </div>

        <div class="q-mt-md">
       
          <q-btn
            label="Login"
            type="submit"
            color="primary"
            class="full-width q-mb-sm"
            :loading="isLoading"
            :disable="isLoading"
          />

        
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
import { useQuasar } from 'quasar'; 

import BE_PRE_URL from 'src/url/index.js';

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const $q = useQuasar(); 

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

    
    $q.notify({
      type: 'positive',
      message: 'Login berhasil!',
      position: 'top',
      timeout: 2000
    });

   
    if (role === 'admin') {
      router.push('/dashboard');
      window.location.reload(); 
    } else if (role === 'customer') {
      router.push('/home'); 
      window.location.reload(); 
    }
  } catch (error) {
    isLoading.value = false; 

    let message = 'Terjadi kesalahan saat login.';
    if (error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    errorMessage.value = message;
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

.my_card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
}
</style>
