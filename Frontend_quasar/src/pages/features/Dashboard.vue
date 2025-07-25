<!-- src/pages/DashboardAdmin.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="q-mx-auto q-px-md q-py-lg" style="max-width: 1200px;">
      <div class="text-h4 text-weight-bold text-grey-9 q-mb-lg text-center">Dashboard Admin</div>

      <!-- Summary Statistics -->
      <div v-if="loadingStats" class="text-center q-py-xl">
        <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
        <div class="text-h6 text-grey-7">Memuat statistik ringkasan...</div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md q-mb-xl">
        <q-card class="shadow-lg rounded-borders q-pa-md text-center">
          <q-card-section>
            <div class="text-subtitle1 text-grey-7">Total Pesanan</div>
            <div class="text-h4 text-weight-bold text-blue-8">{{ totalOrders }}</div>
          </q-card-section>
        </q-card>
        <q-card class="shadow-lg rounded-borders q-pa-md text-center">
          <q-card-section>
            <div class="text-subtitle1 text-grey-7">Total Pendapatan</div>
            <div class="text-h4 text-weight-bold text-green-8">{{ formattedTotalRevenue }}</div>
          </q-card-section>
        </q-card>
        <q-card class="shadow-lg rounded-borders q-pa-md text-center">
          <q-card-section>
            <div class="text-subtitle1 text-grey-7">Jumlah Produk</div>
            <div class="text-h4 text-weight-bold text-purple-8">{{ totalProducts }}</div>
          </q-card-section>
        </q-card>
        <q-card class="shadow-lg rounded-borders q-pa-md text-center">
          <q-card-section>
            <div class="text-subtitle1 text-grey-7">Jumlah Pengguna</div>
            <div class="text-h4 text-weight-bold text-red-8">{{ totalUsers }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-md q-mb-xl">
        <!-- Top Selling Products Chart -->
        <q-card class="shadow-lg rounded-borders q-pa-md">
          <q-card-section>
            <TopSellingProductsChart />
          </q-card-section>
        </q-card>

        <!-- Placeholder for Monthly Orders Chart -->
        <q-card class="shadow-lg rounded-borders q-pa-md flex flex-center" style="min-height: 450px;">
          <q-card-section>
            <div class="text-h6 text-grey-5">Grafik Pesanan per Bulan (akan ditambahkan)</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Placeholder for Orders by Status Chart -->
      <div class="grid grid-cols-1 q-mb-xl">
        <q-card class="shadow-lg rounded-borders q-pa-md flex flex-center" style="min-height: 450px;">
          <q-card-section>
            <div class="text-h6 text-grey-5">Grafik Pesanan Berdasarkan Status (akan ditambahkan)</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- User List Section -->
      <q-card class="shadow-lg rounded-borders q-pa-lg">
        <q-card-section>
          <div class="text-h5 text-weight-bold text-grey-9 q-mb-md text-center">Daftar Pengguna</div>
          <div v-if="isLoadingUsers" class="text-center q-py-xl">
            <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
            <div class="text-h6 text-grey-7">Memuat data pengguna...</div>
          </div>
          <div v-else>
            <div class="flex justify-end q-mb-md">
              <q-input
                filled
                v-model="search"
                placeholder="Cari Username, Email, Nama..."
                dense
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>

            <q-table
              :rows="filteredUsers"
              :columns="userColumns"
              row-key="_id"
              hide-bottom
              flat
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="bg-grey-1">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    @click="col.sortable ? sortData(col.field) : null"
                    :class="{ 'cursor-pointer': col.sortable }"
                  >
                    {{ col.label }}
                    <q-icon
                      v-if="col.sortable && sortKey === col.field"
                      :name="sortAsc ? 'arrow_upward' : 'arrow_downward'"
                      size="sm"
                      class="q-ml-xs"
                    />
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="username" :props="props">{{ props.row.username }}</q-td>
                  <q-td key="email" :props="props">{{ props.row.email }}</q-td>
                  <q-td key="nama" :props="props">{{ props.row.nama }}</q-td>
                  <q-td key="actions" :props="props">
                    <q-btn
                      color="blue-7"
                      icon="edit"
                      size="sm"
                      round
                      flat
                      @click="goToUpdate(props.row._id)"
                      class="q-mr-sm"
                    >
                      <q-tooltip>Update User</q-tooltip>
                    </q-btn>
                    <q-btn
                      color="red-7"
                      icon="person_off"
                      size="sm"
                      round
                      flat
                      @click="deleteUser(props.row._id, props.row.username)"
                    >
                      <q-tooltip>Nonaktifkan User</q-tooltip>
                    </q-btn>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar'; // Import useQuasar for notifications and dialogs
import TopSellingProductsChart from 'src/components/TopSellingProductsChart.vue'; // Adjust path if necessary

// Adjust path if necessary
import BE_PRE_URL from 'src/url/index.js';

const router = useRouter();
const $q = useQuasar(); // Initialize Quasar instance

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

// QTable columns definition for the user table
const userColumns = [
  { name: 'username', label: 'Username', align: 'left', field: 'username', sortable: true },
  { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
  { name: 'nama', label: 'Nama', align: 'left', field: 'nama', sortable: true },
  { name: 'actions', label: 'Actions', align: 'center', sortable: false }
];


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
    $q.notify({
      type: 'negative',
      message: 'Anda tidak memiliki izin akses atau sesi telah berakhir.',
      position: 'top',
      timeout: 3000
    });
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

    // Filter out admin users from totalUsers count if desired, or adjust backend to send only non-admin
    totalUsers.value = usersRes.data.data ? usersRes.data.data.length : 0;

  } catch (error) {
    console.error('Gagal mengambil data statistik:', error);
    let errorMessage = 'Terjadi kesalahan saat memuat statistik dashboard.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });
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
    let errorMessage = 'Terjadi kesalahan saat mengambil data pengguna.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });
  } finally {
    isLoadingUsers.value = false;
  }
};

const deleteUser = async (id, username) => {
  $q.dialog({
    title: 'Konfirmasi Menonaktifkan User',
    message: `Apakah Anda yakin ingin menonaktifkan user "${username}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    isLoadingUsers.value = true; // Set loading for user table
    const userInfo = getUserInfoFromLocalStorage();
    if (!userInfo) {
      isLoadingUsers.value = false;
      $q.notify({
        type: 'negative',
        message: 'Anda tidak memiliki izin. Silakan login kembali.',
        position: 'top',
        timeout: 3000
      });
      return;
    }

    try {
      await axios.delete(`http://${BE_PRE_URL}/auth/${id}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });
      $q.notify({
        type: 'positive',
        message: `User "${username}" berhasil dinonaktifkan.`,
        position: 'top',
        timeout: 2000
      });
      await fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Gagal menonaktifkan user:', err);
      let errorMessage = 'Gagal menonaktifkan user. Pastikan Anda memiliki izin.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        timeout: 3000
      });
    } finally {
      isLoadingUsers.value = false;
    }
  });
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
  return totalRevenue.value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

onMounted(() => {
  fetchSummaryStats();
  fetchUsers();
});
</script>

<style scoped>
/* No custom styles needed for basic elements as Quasar handles them */
</style>
