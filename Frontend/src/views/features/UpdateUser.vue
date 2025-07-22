<template>
  <div class="max-w-md mx-auto p-6 border mt-10 shadow-md rounded-md">
    <h2 class="text-xl font-semibold text-center mb-6">Update User</h2>

    <!-- Loading saat ambil data user -->
    <div v-if="isLoading" class="text-center py-8 text-blue-600 font-semibold">
      Memuat data pengguna...
    </div>

    <!-- Form tampil jika data sudah dimuat -->
    <form v-else @submit.prevent="handleUpdate">
      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm">Username</label>
        <input v-model="form.username" type="text" class="w-full border rounded px-3 py-2" required />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm">Email</label>
        <input v-model="form.email" type="email" class="w-full border rounded px-3 py-2" required />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm">Nama</label>
        <input v-model="form.nama" type="text" class="w-full border rounded px-3 py-2" required />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium text-sm">Password</label>
        <input v-model="form.password" type="text" class="w-full border rounded px-3 py-2" required />
      </div>

      <!-- Loading saat proses update -->
      <div v-if="isUpdating" class="text-center text-blue-500 font-medium my-4">
        Menyimpan perubahan...
      </div>

      <div class="flex justify-between mt-6">
        <button type="button" @click="goBack" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
          Back
        </button>
        <button
          type="submit"
          :disabled="isUpdating"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {{ isUpdating ? 'Updating...' : 'Update' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { reactive, onMounted, ref } from 'vue'
import axios from 'axios'
import BE_PRE_URL from '../../url/index.js'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)      // Loading saat ambil data user
const isUpdating = ref(false)    // Loading saat update

const form = reactive({
  username: '',
  email: '',
  nama: '',
  password: ''
})

const userId = ref('')

// Ambil data user berdasarkan ID
const fetchUserById = async (id) => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('jwt')
    const res = await axios.get(`http://${BE_PRE_URL}/auth/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const user = res.data.data
    form.username = user.username
    form.email = user.email
    form.nama = user.nama
    form.password = user.password // Tampilkan password (hash)

    userId.value = user._id
  } catch (err) {
    alert('Gagal mengambil data user')
    console.error(err)
    router.push('/dashboard')
  } finally {
    isLoading.value = false
  }
}

// Fungsi untuk mengupdate data
const handleUpdate = async () => {
  isUpdating.value = true
  try {
    const token = localStorage.getItem('jwt')

    const payload = {
      username: form.username,
      email: form.email,
      nama: form.nama,
      password: form.password,
      user_id: userId.value
    }

    await axios.patch(`http://${BE_PRE_URL}/auth/update`, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // alert('User berhasil diupdate!')
    router.push('/dashboard')
  } catch (err) {
    alert('Gagal update user')
    console.error(err)
  } finally {
    isUpdating.value = false
  }
}

// Kembali ke halaman sebelumnya
const goBack = () => {
  router.back()
}

// Saat halaman dibuka, ambil data user
onMounted(() => {
  const id = route.params.id
  fetchUserById(id)
})
</script>

<style scoped>
input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
}
</style>
