<template>
  <div class="max-w-6xl mx-auto p-6 border rounded-md shadow-md mt-10">
    <h1 class="text-center text-2xl font-semibold mb-4">Daftar Pengguna</h1>

    <div v-if="isLoading" class="text-center py-4 text-blue-600 font-semibold">
      Memuat data pengguna...
    </div>

    <div v-else>
      <div class="flex justify-end mb-4">
        <input
          v-model="search"
          type="text"
          placeholder="Search"
          class="border px-3 py-1 rounded-md text-sm"
        />
      </div>

      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="border px-3 py-2 cursor-pointer" @click="sortData('username')">Username</th>
            <th class="border px-3 py-2 cursor-pointer" @click="sortData('email')">Email</th>
            <th class="border px-3 py-2 cursor-pointer" @click="sortData('nama')">Nama</th>
            <th class="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(user, index) in filteredUsers"
            :key="index"
            class="hover:bg-gray-50"
          >
            <td class="border px-3 py-2">{{ user.username }}</td>
            <td class="border px-3 py-2">{{ user.email }}</td>
            <td class="border px-3 py-2">{{ user.nama }}</td>
            <td class="border px-3 py-2 flex gap-2">
              <button
                @click="goToUpdate(user._id)"
                class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
              >
                Update
              </button>
              <button
                @click="deleteUser(user._id)"
                class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                Non Aktifkan
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BE_PRE_URL from '../../url/index.js'

const token = localStorage.getItem('jwt')
const userData = localStorage.getItem('userData')
const role = localStorage.getItem('role')


console.log(userData)

const router = useRouter()

const users = ref([])
const isLoading = ref(true)
const search = ref('')
const sortKey = ref('')
const sortAsc = ref(true)

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('jwt')
    const response = await axios.get(`http://${BE_PRE_URL}/auth`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    users.value = response.data.data
  } catch (error) {
    console.error('Gagal mengambil data user:', error)
    alert('Terjadi kesalahan saat mengambil data pengguna.')
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async (id) => {
  const confirmed = confirm('Apakah Anda yakin ingin menghapus user ini?')
  if (!confirmed) return

  isLoading.value = true
  try {
    const token = localStorage.getItem('jwt')
    await axios.delete(`http://${BE_PRE_URL}/auth/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    // alert('User berhasil dihapus.')
    await fetchUsers() // Refresh data
  } catch (err) {
    console.error('Gagal menghapus user:', err)
    alert('Gagal menghapus user.')
  } finally {
    isLoading.value = false
  }
}

const sortData = (key) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const filteredUsers = computed(() => {
  let temp = users.value.filter((u) =>
    u.username.toLowerCase().includes(search.value.toLowerCase()) ||
    u.email.toLowerCase().includes(search.value.toLowerCase()) ||
    u.nama.toLowerCase().includes(search.value.toLowerCase())
  )

  if (sortKey.value) {
    temp.sort((a, b) => {
      const valA = a[sortKey.value].toLowerCase()
      const valB = b[sortKey.value].toLowerCase()
      return sortAsc.value ? valA.localeCompare(valB) : valB.localeCompare(valA)
    })
  }

  return temp
})

const goToUpdate = (id) => {
  router.push(`/update/${id}`)
}

onMounted(() => {
  fetchUsers()
})




function logout() {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('jwt')
  router.push('/')
}

const l = localStorage.getItem('isLoggedIn');

console.log(l)


</script>

<style scoped>
th {
  font-weight: 600;
}
</style>