<!-- src/pages/ManagePipes.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="q-mx-auto q-px-md q-py-lg" style="max-width: 1200px;">
      <div class="q-mb-lg">
        <div class="text-h4 text-weight-bold text-grey-9 q-mb-sm">Kelola Pipa</div>
        <p class="text-body1 text-grey-7">Manajemen data pipa untuk sistem distribusi</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <div class="flex flex-col items-center">
          <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
          <p class="text-h6 text-grey-7">Memuat data pipa...</p>
        </div>
      </div>

      <!-- Error State -->
      <q-banner v-else-if="error" class="bg-red-1 text-red-8 q-mb-lg rounded-borders q-mx-auto">
        <template v-slot:avatar>
          <q-icon name="error" color="red-4" />
        </template>
        <div class="text-body1 text-weight-bold">{{ error }}</div>
        <template v-slot:action>
          <q-btn
            @click="fetchPipes"
            color="negative"
            label="Coba Lagi"
            unelevated
          />
        </template>
      </q-banner>

      <!-- Main Content when data is loaded -->
      <div v-else>
        <div class="q-mb-lg flex flex-col sm:flex-row sm:items-center sm:justify-between q-gutter-md">
          <div class="flex items-center">
            <span class="text-body1 text-grey-7">
              Total: <span class="text-weight-medium">{{ pipes.length }}</span> pipa
            </span>
          </div>
          <div class="flex q-gutter-sm">
            <q-btn
              @click="fetchPipes"
              icon="refresh"
              label="Refresh"
              color="grey-6"
              text-color="dark"
              unelevated
            />
            <q-btn
              to="/tambah-pipa"
              icon="add"
              label="Tambah Pipa"
              color="positive"
              unelevated
            />
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="gt-sm">
          <q-card class="shadow-2 rounded-borders overflow-hidden">
            <q-table
              :rows="pipes"
              :columns="columns"
              row-key="_id"
              hide-bottom
              flat
            >
              <template v-slot:header="props">
                <q-tr :props="props" class="bg-grey-1">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-left text-grey-7 text-weight-medium text-uppercase">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="hover-bg-grey-1">
                  <q-td key="pipe" :props="props">
                    <div class="flex items-center">
                      <q-img v-if="props.row.imageUrl"
                             :src="props.row.imageUrl"
                             :alt="props.row.pipeName"
                             class="rounded-borders q-mr-md"
                             style="height: 64px; width: 64px; object-fit: cover;"
                             no-native-menu
                      >
                        <template v-slot:error>
                          <div class="absolute-full flex flex-center bg-negative text-white">
                            Gagal memuat gambar
                          </div>
                        </template>
                      </q-img>
                      <div v-else class="flex-shrink-0 q-mr-md flex flex-center bg-grey-3 rounded-borders" style="height: 64px; width: 64px;">
                        <q-icon name="category" size="md" color="grey-6" />
                      </div>
                      <div>
                        <div class="text-body1 text-weight-medium text-grey-9">{{ props.row.pipeName }}</div>
                        <div class="text-body2 text-grey-7">{{ props.row.pipeType }}</div>
                        <div class="text-caption text-grey-6">{{ props.row.pipeClass }}</div>
                      </div>
                    </div>
                  </q-td>

                  <q-td key="specifications" :props="props">
                    <div class="text-body2 text-grey-9">
                      <div class="q-mb-xs">Ø {{ props.row.diameter }}mm</div>
                      <div class="text-grey-7">{{ props.row.length }}m × {{ props.row.wallThickness }}mm</div>
                      <div class="text-caption text-grey-6">{{ props.row.material }}</div>
                    </div>
                  </q-td>

                  <q-td key="price_stock" :props="props">
                    <div class="text-body1 text-weight-medium text-grey-9">
                      {{ formatPrice(props.row.pricePerMeter) }}
                    </div>
                    <div class="text-body2 text-grey-7">per meter</div>
                    <div class="text-caption text-grey-6">Stok: {{ props.row.stock }}</div>
                  </q-td>

                  <q-td key="details" :props="props">
                    <div class="text-body2 text-grey-9">
                      <div class="q-mb-xs">Warna: {{ props.row.color }}</div>
                      <div class="text-caption text-grey-7">{{ formatDate(props.row.productionDate) }}</div>
                    </div>
                    <div v-if="props.row.description" class="text-caption text-grey-6 q-mt-xs truncate-text">
                      {{ props.row.description }}
                    </div>
                  </q-td>

                  <q-td key="status" :props="props">
                    <q-badge :color="getStatusColor(props.row.status)" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders">
                      {{ props.row.status }}
                    </q-badge>
                  </q-td>

                  <q-td key="actions" :props="props">
                    <div class="flex q-gutter-xs">
                      <q-btn
                        round
                        flat
                        icon="edit"
                        color="blue-8"
                        :to="`/update-pipa/${props.row._id}`"
                        size="sm"
                      />
                      <q-btn
                        round
                        flat
                        icon="delete"
                        color="negative"
                        @click="promptDelete(props.row._id, props.row.pipeName)"
                        size="sm"
                      />
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card>
        </div>

        <!-- Mobile Card View -->
        <div class="lt-md">
          <div class="q-gutter-md">
            <q-card v-for="pipe in pipes" :key="pipe._id" class="shadow-2 rounded-borders">
              <q-card-section class="row items-start q-gutter-md">
                <div class="col-auto">
                  <q-img v-if="pipe.imageUrl"
                         :src="pipe.imageUrl"
                         :alt="pipe.pipeName"
                         class="rounded-borders"
                         style="height: 80px; width: 80px; object-fit: cover;"
                         no-native-menu
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-negative text-white">
                        Gagal memuat gambar
                      </div>
                    </template>
                  </q-img>
                  <div v-else class="flex-shrink-0 flex flex-center bg-grey-3 rounded-borders" style="height: 80px; width: 80px;">
                    <q-icon name="category" size="md" color="grey-6" />
                  </div>
                </div>
                <div class="col">
                  <div class="text-h6 text-weight-semibold text-grey-9">{{ pipe.pipeName }}</div>
                  <div class="text-body2 text-grey-7">{{ pipe.pipeType }} • {{ pipe.pipeClass }}</div>
                  <q-badge :color="getStatusColor(pipe.status)" class="q-px-sm q-py-xs text-caption text-weight-medium rounded-borders q-mt-sm">
                    {{ pipe.status }}
                  </q-badge>
                </div>
              </q-card-section>

              <q-separator inset />

              <q-card-section class="q-gutter-y-sm">
                <div class="row justify-between">
                  <span class="text-body2 text-grey-7">Diameter:</span>
                  <span class="text-body2 text-weight-medium text-grey-9">{{ pipe.diameter }}mm</span>
                </div>
                <div class="row justify-between">
                  <span class="text-body2 text-grey-7">Panjang:</span>
                  <span class="text-body2 text-weight-medium text-grey-9">{{ pipe.length }}m</span>
                </div>
                <div class="row justify-between">
                  <span class="text-body2 text-grey-7">Ketebalan Dinding:</span>
                  <span class="text-body2 text-weight-medium text-grey-9">{{ pipe.wallThickness }}mm</span>
                </div>
                <div class="row justify-between">
                  <span class="text-body2 text-grey-7">Material:</span>
                  <span class="text-body2 text-weight-medium text-grey-9">{{ pipe.material }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-body2 text-grey-7">Warna:</span>
                  <span class="text-body2 text-weight-medium text-grey-9">{{ pipe.color }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-body2 text-grey-7">Stok:</span>
                  <span class="text-body2 text-weight-medium text-grey-9">{{ pipe.stock }}</span>
                </div>
                <div class="row justify-between q-mt-md">
                  <span class="text-h6 text-weight-bold text-green-8">Harga per Meter:</span>
                  <span class="text-h6 text-weight-bold text-green-8">{{ formatPrice(pipe.pricePerMeter) }}</span>
                </div>
              </q-card-section>

              <q-card-section v-if="pipe.description" class="q-pt-none">
                <div class="text-body2 text-grey-7">Deskripsi:</div>
                <div class="text-body2 text-grey-8 truncate-text-mobile">{{ pipe.description }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <div class="text-body2 text-grey-7">Tanggal Produksi:</div>
                <div class="text-body2 text-grey-8">{{ formatDate(pipe.productionDate) }}</div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right" class="q-pa-md">
                <q-btn
                  icon="edit"
                  label="Edit"
                  color="blue-8"
                  :to="`/update-pipa/${pipe._id}`"
                  unelevated
                  size="md"
                />
                <q-btn
                  icon="delete"
                  label="Hapus"
                  color="negative"
                  @click="promptDelete(pipe._id, pipe.pipeName)"
                  unelevated
                  size="md"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- No Data State -->
        <div v-if="!loading && !error && pipes.length === 0" class="text-center q-py-xl">
          <q-icon name="category" size="xl" color="grey-4" class="q-mb-md" />
          <div class="text-h6 text-grey-7 q-mb-sm">Tidak ada data pipa</div>
          <p class="text-body1 text-grey-7">Mulai dengan menambahkan pipa pertama Anda.</p>
          <q-btn
            to="/tambah-pipa"
            icon="add"
            label="Tambah Pipa"
            color="positive"
            unelevated
            class="q-mt-md"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

// Pastikan path ini benar di proyek Quasar Anda
import BE_PRE_URL from 'src/url/index.js';

const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance

const loading = ref(true);
const error = ref(null);
const pipes = ref([]);

// QTable columns definition
const columns = [
  {
    name: 'pipe',
    required: true,
    label: 'Pipa',
    align: 'left',
    field: row => row.pipeName,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'specifications', label: 'Spesifikasi', align: 'left', field: 'diameter', sortable: true },
  { name: 'price_stock', label: 'Harga & Stok', align: 'left', field: 'pricePerMeter', sortable: true },
  { name: 'details', label: 'Detail', align: 'left', field: 'color' },
  { name: 'status', label: 'Status', align: 'left', field: 'status', sortable: true },
  { name: 'actions', label: 'Aksi', align: 'right' }
];

// Fetch Pipa Data
const fetchPipes = async () => {
  loading.value = true;
  error.value = null;

  try {
    const token = localStorage.getItem('jwt'); // Ambil token dari localStorage
    const config = {
      headers: {
        Authorization: `Bearer ${token}` // Tambahkan token ke header
      }
    };
    const response = await axios.get(`http://${BE_PRE_URL}/pipa`, config); // Gunakan config
    pipes.value = response.data.data || response.data || [];
    console.log("Fetched pipes:", pipes.value);
  } catch (err) {
    console.error('Fetch error:', err);
    let errorMessage = "Gagal memuat data pipa. Silakan coba lagi nanti.";
    if (err.response && err.response.status === 401) {
      errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      // Redirect ke login jika token tidak valid/expired
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        timeout: 3000
      });
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    } else if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    error.value = errorMessage;
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });
  } finally {
    loading.value = false;
  }
};

// Menampilkan modal konfirmasi delete menggunakan Quasar Dialog
const promptDelete = (id, name) => {
  $q.dialog({
    title: 'Hapus Pipa',
    message: `Apakah Anda yakin ingin menghapus pipa **"${name}"**? Tindakan ini tidak dapat dibatalkan.`,
    cancel: true,
    persistent: true,
    html: true // Penting untuk merender bold markdown
  }).onOk(() => {
    confirmDelete(id, name);
  }).onCancel(() => {
    $q.notify({
      type: 'info',
      message: 'Penghapusan pipa dibatalkan.',
      position: 'top',
      timeout: 1500
    });
  });
};

// Logika penghapusan setelah konfirmasi
const confirmDelete = async (id, name) => {
  try {
    const token = localStorage.getItem('jwt');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    await axios.delete(`http://${BE_PRE_URL}/pipa/${id}`, config);
    // Refresh list pipa
    pipes.value = pipes.value.filter(pipe => pipe._id !== id);
    $q.notify({
      type: 'positive',
      message: `Pipa "${name}" berhasil dihapus!`,
      position: 'top',
      timeout: 2000
    });
  } catch (err) {
    console.error('Delete error:', err);
    let errorMessage = "Gagal menghapus pipa. Silakan coba lagi.";
    if (err.response && err.response.status === 401) {
      errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        timeout: 3000
      });
      router.push({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
    } else if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get status color for Quasar badge
const getStatusColor = (status) => {
  switch (status) {
    case 'Aktif':
      return 'green-8';
    case 'Tidak Aktif':
      return 'red-8';
    case 'Habis Stok':
      return 'yellow-8';
    default:
      return 'grey-7';
  }
};

const formatPrice = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// Ambil data pipa ketika komponen dimuat
onMounted(() => {
  fetchPipes();
});
</script>

<style scoped>
/* Custom styles */
.hover-bg-grey-1:hover {
  background-color: #f5f5f5; /* Quasar's grey-1 */
}

/* For truncating text in table cells */
.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* For truncating text in mobile cards */
.truncate-text-mobile {
  display: -webkit-box;
  -webkit-line-clamp: 3; 
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
