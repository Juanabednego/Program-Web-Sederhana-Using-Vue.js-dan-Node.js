<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="username">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            id="username"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="password">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm text-center">
          {{ errorMessage }}
        </div>

        <div class="flex justify-between items-center">
          <button
            type="submit"
            class="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mr-2 transition"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Loading...</span>
            <span v-else>Login</span>
          </button>

          <button
            type="button"
            class="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg ml-2 transition"
            @click="goToRegister"
          >
            Registrasi
          </button>
        </div>
      </form>



    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import BE_PRE_URL from '../../url/index.js'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const test = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post(`http://${BE_PRE_URL}/auth/login`, {
      username: username.value,
      password: password.value,
    })

    const { data, jwt, role, user_id } = response.data

    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('jwt', jwt)
    localStorage.setItem('role', role) // Simpan role
    localStorage.setItem('user_id', user_id)
    localStorage.setItem('userData', JSON.stringify(data))

    if(localStorage.getItem('logout')){
      localStorage.removeItem('logout')
    }

   


    // Navigasi berdasarkan role
    if (role === 'admin') {
      router.push('/dashboard')
      window.location.reload() // Refresh paksa setelah login admin
    } else if (role === 'customer') {
      router.push('/home') // Navigasi ke halaman customer
      window.location.reload() // Refresh paksa setelah login customer
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      errorMessage.value = error.response.data.message
    } else {
      errorMessage.value = 'Terjadi kesalahan saat login.'
    }
  } finally {
    isLoading.value = false
  }
}




const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
/* Styling tambahan opsional */
</style>