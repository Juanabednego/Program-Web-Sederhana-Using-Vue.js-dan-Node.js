<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Registrasi</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="username">Username</label>
          <input
            v-model="form.username"
            type="text"
            id="username"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan username"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="email">Email</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan email"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="name">Nama Lengkap</label>
          <input
            v-model="form.name"
            type="text"
            id="name"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="password">Password</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan password"
            required
          />
        </div>

        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div class="flex justify-center">
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Mendaftarkan...</span>
            <span v-else>Registrasi</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BE_PRE_URL from '../../url/index.js'

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

const form = ref({
  username: '',
  email: '',
  name: '',
  password: ''
})

const handleRegister = async () => {
  if (form.value.username && form.value.email && form.value.name && form.value.password) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await axios.post(`http://${BE_PRE_URL}/auth/register`, {
        username: form.value.username,
        email: form.value.email,
        nama: form.value.name,
        password: form.value.password
      })

      console.log('Registrasi berhasil:', response.data)

      // Arahkan ke halaman login (bukan login otomatis)
      router.push('/')
    } catch (error) {
      console.error('Error saat registrasi:', error)

      if (error.response?.data?.message) {
        errorMessage.value = error.response.data.message
      } else {
        errorMessage.value = 'Terjadi kesalahan saat registrasi.'
      }
    } finally {
      isLoading.value = false
    }
  } else {
    errorMessage.value = 'Semua field harus diisi.'
  }
}
</script>

<style scoped>
/* Styling opsional */
</style>
