<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Dashboard Admin</h1>

    <div v-if="loadingStats" class="text-center py-4 text-blue-600 font-semibold mb-6">
      Memuat statistik ringkasan...
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white shadow-lg rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-700">Total Pesanan</h3>
        <p class="text-3xl font-bold text-blue-600">{{ totalOrders }}</p>
      </div>
      <div class="bg-white shadow-lg rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-700">Total Pendapatan</h3>
        <p class="text-3xl font-bold text-green-600">Rp {{ formattedTotalRevenue }}</p>
      </div>
      <div class="bg-white shadow-lg rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-700">Jumlah Produk</h3>
        <p class="text-3xl font-bold text-purple-600">{{ totalProducts }}</p>
      </div>
      <div class="bg-white shadow-lg rounded-lg p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-700">Jumlah Pengguna</h3>
        <p class="text-3xl font-bold text-red-600">{{ totalUsers }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <TopSellingProductsChart />

      <div class="bg-white shadow-lg rounded-lg p-6 flex items-center justify-center h-[450px]">
        <h3 class="text-xl text-gray-500">Grafik Pesanan per Bulan (akan ditambahkan)</h3>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
      <div class="bg-white shadow-lg rounded-lg p-6 flex items-center justify-center h-[450px]">
        <h3 class="text-xl text-gray-500">Grafik Pesanan Berdasarkan Status (akan ditambahkan)</h3>
        </div>
    </div>


    <div class="max-w-6xl mx-auto p-6 border rounded-md shadow-md bg-white">
      <h1 class="text-center text-2xl font-semibold mb-4 text-gray-800">Daftar Pengguna</h1>
      <div v-if="isLoadingUsers" class="text-center py-4 text-blue-600 font-semibold">
        Memuat data pengguna...
      </div>
      <div v-else>
        <div class="flex justify-end mb-4">
          <input
            v-model="search"
            type="text"
            placeholder="Search"
            class="border px-3 py-1 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse min-w-max">
            <thead>
              <tr class="bg-gray-100 text-left text-gray-700">
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
                class="hover:bg-gray-50 transition-colors duration-150"
              >
                <td class="border px-3 py-2">{{ user.username }}</td>
                <td class="border px-3 py-2">{{ user.email }}</td>
                <td class="border px-3 py-2">{{ user.nama }}</td>
                <td class="border px-3 py-2 flex gap-2">
                  <button
                    @click="goToUpdate(user._id)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors duration-150"
                  >
                    Update
                  </button>
                  <button
                    @click="deleteUser(user._id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-150"
                  >
                    Non Aktifkan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BE_PRE_URL from '../../url/index.js';
import TopSellingProductsChart from '../../components/TopSellingProductsChart.vue';

const router = useRouter();

const loadingStats = ref(true);
const totalOrders = ref(0);
const totalRevenue = ref(0);
const totalProducts = ref(0);
const totalUsers = ref(0);

const users = ref([]);
const isLoadingUsers = ref(true);
const search = ref('');
const sortKey = ref('');
const sortAsc = ref(true);

function getUserInfoFromLocalStorage() {
  const user = localStorage.getItem('userData');
  const token = localStorage.getItem('jwt');
  const role = localStorage.getItem('role');
  if (!user || !token || role !== 'admin') {
    return null;
  }
  return { user: JSON.parse(user), token, role };
}

const fetchSummaryStats = async () => {
  loadingStats.value = true;
  const userInfo = getUserInfoFromLocalStorage();

  if (!userInfo) {
    alert('Anda tidak memiliki izin akses atau sesi telah berakhir.');
    localStorage.removeItem('userData');
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    loadingStats.value = false;
    return;
  }

  const config = {
    headers: {
      Authorization: `Bearer ${userInfo.token}`,
    },
  };

  try {
    const [ordersRes, pipaRes, usersRes] = await Promise.all([
      axios.get(`http://${BE_PRE_URL}/orders`, config),
      axios.get(`http://${BE_PRE_URL}/pipa`, config), 
      axios.get(`http://${BE_PRE_URL}/auth`, config), 
    ]);

    totalOrders.value = ordersRes.data.length;
    totalRevenue.value = ordersRes.data.reduce((sum, order) => sum + order.totalPrice, 0);

    totalProducts.value = pipaRes.data ? pipaRes.data.length : 0;

    totalUsers.value = usersRes.data.data ? usersRes.data.data.length : 0; 

  } catch (error) {
    console.error('Gagal mengambil data statistik:', error);
    alert('Terjadi kesalahan saat memuat statistik dashboard.');
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('userData');
      localStorage.removeItem('jwt');
      localStorage.removeItem('role');
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    }
  } finally {
    loadingStats.value = false;
  }
};

const fetchUsers = async () => {
  isLoadingUsers.value = true;
  const userInfo = getUserInfoFromLocalStorage();

  if (!userInfo) {
    isLoadingUsers.value = false;
    return;
  }

  try {
    const response = await axios.get(`http://${BE_PRE_URL}/auth`, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    });
    users.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
    alert('Terjadi kesalahan saat mengambil data pengguna.');
  } finally {
    isLoadingUsers.value = false;
  }
};

const deleteUser = async (id) => {
  const confirmed = confirm('Apakah Anda yakin ingin menonaktifkan user ini?');
  if (!confirmed) return;

  isLoadingUsers.value = true;
  const userInfo = getUserInfoFromLocalStorage();
  if (!userInfo) {
      isLoadingUsers.value = false;
      return;
  }

  try {
    await axios.delete(`http://${BE_PRE_URL}/auth/${id}`, {
      headers: {
        Authorization: `Bearer ${userInfo.token}`
      }
    });
    alert('User berhasil dinonaktifkan.');
    await fetchUsers();
  } catch (err) {
    console.error('Gagal menonaktifkan user:', err);
    alert('Gagal menonaktifkan user. Pastikan Anda memiliki izin.');
  } finally {
    isLoadingUsers.value = false;
  }
};

const sortData = (key) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
};

const filteredUsers = computed(() => {
  let temp = users.value.filter((u) =>
    u.username.toLowerCase().includes(search.value.toLowerCase()) ||
    u.email.toLowerCase().includes(search.value.toLowerCase()) ||
    (u.nama && u.nama.toLowerCase().includes(search.value.toLowerCase()))
  );

  if (sortKey.value) {
    temp.sort((a, b) => {
      const valA = (a[sortKey.value] || '').toLowerCase();
      const valB = (b[sortKey.value] || '').toLowerCase();
      return sortAsc.value ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }
  return temp;
});

const goToUpdate = (id) => {
  router.push(`/update/${id}`);
};

const formattedTotalRevenue = computed(() => {
  return totalRevenue.value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

onMounted(() => {
  fetchSummaryStats();
  fetchUsers();
});
</script>

<style scoped>
th {
  font-weight: 600;
}
</style>