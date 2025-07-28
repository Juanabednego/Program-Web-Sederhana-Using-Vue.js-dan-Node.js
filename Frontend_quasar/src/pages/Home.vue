<!-- src/pages/Home.vue -->
<template>
  <q-page class="q-pa-md bg-grey-1">
    <!-- Header Hero Section -->
    <div class="hero-section text-white text-center hero-padding hero-background-image">
      <div class="hero-overlay"></div> 
      <div class="q-mx-auto q-px-md relative-position" style="max-width: 1200px; z-index: 2;">
        <div class="text-h3 md:text-h2 text-weight-bold q-mb-md text-shadow-lg animate-fade-in">
          Katalog Pipa Terbaik
        </div>
        <div class="text-h6 md:text-h5 q-mb-xl opacity-90 animate-fade-in delay-200">
          Temukan pipa berkualitas tinggi untuk kebutuhan proyek Anda
        </div>
        <div class="flex flex-center q-gutter-md animate-fade-in delay-400">
          <q-chip outline color="white" text-color="blue-grey-10" icon="check_circle" class="text-weight-medium q-py-sm q-px-md shadow-2 hero-chip">
            Kualitas Terjamin
          </q-chip>
          <q-chip outline color="white" text-color="blue-grey-10" icon="attach_money" class="text-weight-medium q-py-sm q-px-md shadow-2 hero-chip">
            Harga Kompetitif
          </q-chip>
          <q-chip outline color="white" text-color="blue-grey-10" icon="thumb_up" class="text-weight-medium q-py-sm q-px-md shadow-2 hero-chip">
            Dipercaya Pelanggan
          </q-chip>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="q-mx-auto q-px-md q-py-xl" style="max-width: 1200px;">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-center q-py-xl">
        <div class="text-center">
          <q-spinner-dots color="primary" size="4em" class="q-mb-md" />
          <div class="text-h5 text-grey-7 text-weight-medium">Memuat katalog pipa...</div>
          <p class="text-body2 text-grey-6 q-mt-sm">Mohon tunggu sebentar.</p>
        </div>
      </div>

      <!-- Error State -->
      <q-banner v-else-if="error" class="bg-red-1 text-red-8 q-mb-lg rounded-borders q-mx-auto shadow-2" style="max-width: 700px;">
        <template v-slot:avatar>
          <q-icon name="error_outline" color="red-4" size="md" />
        </template>
        <div class="text-h6 text-weight-bold">Terjadi Kesalahan!</div>
        <div class="text-body1 q-mb-md">{{ error }}</div>
        <template v-slot:action>
          <q-btn
            @click="fetchPipes"
            color="negative"
            label="Coba Lagi"
            icon="refresh"
            unelevated
            class="q-px-md"
          />
        </template>
      </q-banner>

      <!-- Empty State -->
      <q-card v-else-if="pipes.length === 0" class="shadow-2 rounded-borders q-pa-xl text-center q-mx-auto" style="max-width: 600px;">
        <q-icon name="category" size="xl" color="grey-4" class="q-mb-md" />
        <div class="text-h5 text-weight-semibold text-grey-9 q-mb-sm">Belum Ada Pipa</div>
        <div class="text-body1 text-grey-7">Katalog pipa akan segera tersedia. Silakan kembali nanti!</div>
      </q-card>

      <!-- Content when pipes are loaded -->
      <div v-else>
        <!-- Stats Grid -->
        <div class="row q-col-gutter-lg q-mb-xl">
          <q-card class="col-12 col-md-3 shadow-2 rounded-borders q-pa-md text-center stat-card q-hover-shadow--4">
            <q-icon name="inventory_2" size="xl" color="blue-8" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-blue-8 q-mb-xs">{{ pipes.length }}</div>
            <div class="text-grey-7 text-body1">Total Produk</div>
          </q-card>
          <q-card class="col-12 col-md-3 shadow-2 rounded-borders q-pa-md text-center stat-card q-hover-shadow--4">
            <q-icon name="check_circle_outline" size="xl" color="green-8" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-green-8 q-mb-xs">{{ availablePipes }}</div>
            <div class="text-grey-7 text-body1">Produk Tersedia</div>
          </q-card>
          <q-card class="col-12 col-md-3 shadow-2 rounded-borders q-pa-md text-center stat-card q-hover-shadow--4">
            <q-icon name="category" size="xl" color="purple-8" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-purple-8 q-mb-xs">{{ uniqueTypes }}</div>
            <div class="text-grey-7 text-body1">Jenis Pipa Unik</div>
          </q-card>
          <q-card class="col-12 col-md-3 shadow-2 rounded-borders q-pa-md text-center stat-card q-hover-shadow--4">
            <q-icon name="payments" size="xl" color="orange-8" class="q-mb-sm" />
            <div class="text-h4 text-weight-bold text-orange-8 q-mb-xs">{{ formatPrice(averagePrice) }}</div>
            <div class="text-grey-7 text-body1">Harga Rata-rata</div>
          </q-card>
        </div>

        <!-- Filters Section -->
        <q-card class="shadow-2 rounded-borders q-pa-md q-mb-xl filter-card">
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-6">
              <q-input
                filled
                v-model="searchQuery"
                placeholder="Cari pipa berdasarkan nama, jenis, atau material..."
                clearable
                dense
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                filled
                v-model="filterType"
                :options="['', 'PVC', 'HDPE', 'PPR', 'Besi', 'Lainnya']"
                label="Semua Jenis"
                clearable
                dense
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                filled
                v-model="filterStatus"
                :options="['', 'Aktif', 'Tidak Aktif', 'Habis Stok']"
                label="Semua Status"
                clearable
                dense
              />
            </div>
          </div>
        </q-card>

        <!-- Product Grid -->
        <div class="row q-col-gutter-lg">
          <q-card
            v-for="pipe in filteredPipes"
            :key="pipe._id"
            class="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-2 shadow-2 rounded-borders overflow-hidden product-card q-hover-shadow--6 animate-scale-in"
          >
            <div class="relative">
              <q-img
                :src="pipe.imageUrl ? pipe.imageUrl : 'https://placehold.co/400x180/CFD8DC/607D8B?text=No+Image'"
                :alt="pipe.pipeName"
                class="product-image"
                loading="lazy"
                no-native-menu
                fit="cover"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
                    <q-icon name="broken_image" size="lg" />
                    <span class="q-ml-sm">Gambar tidak tersedia</span>
                  </div>
                </template>
              </q-img>

              <q-badge
                :color="getStatusBadgeColor(pipe.status)"
                class="absolute-top-right q-ma-sm q-px-sm q-py-xs text-caption text-weight-medium rounded-borders shadow-1"
              >
                {{ pipe.status }}
              </q-badge>

              <q-badge
                :color="getTypeBadgeColor(pipe.pipeType)"
                class="absolute-top-left q-ma-sm q-px-sm q-py-xs text-caption text-weight-medium rounded-borders shadow-1"
              >
                {{ pipe.pipeType }}
              </q-badge>
            </div>

            <q-card-section>
              <div class="text-h6 text-weight-bold text-grey-9 q-mb-sm product-name-clamp">
                {{ pipe.pipeName }}
              </div>

              <div class="q-col-gutter-y-sm q-mb-md">
                <div class="row justify-between items-center text-body2 text-grey-7">
                  <span>Diameter:</span>
                  <span class="text-weight-medium text-grey-9">{{ pipe.diameter }}mm</span>
                </div>
                <div class="row justify-between items-center text-body2 text-grey-7">
                  <span>Panjang:</span>
                  <span class="text-weight-medium text-grey-9">{{ pipe.length }}m</span>
                </div>
                <div class="row justify-between items-center text-body2 text-grey-7">
                  <span>Kelas:</span>
                  <span class="text-weight-medium text-grey-9">{{ pipe.pipeClass }}</span>
                </div>
                <div class="row justify-between items-center text-body2 text-grey-7">
                  <span>Material:</span>
                  <span class="text-weight-medium text-grey-9">{{ pipe.material }}</span>
                </div>
                <div class="row justify-between items-center text-body2 text-grey-7">
                  <span>Warna:</span>
                  <span class="text-weight-medium text-grey-9">{{ pipe.color }}</span>
                </div>
                <div class="row justify-between items-center text-body2 text-grey-7">
                  <span>Stok:</span>
                  <span class="text-weight-bold text-blue-grey-9">{{ pipe.stock }} unit</span>
                </div>
              </div>

              <div class="row justify-between items-center q-mb-md">
                <span class="text-h5 text-weight-bold text-green-8">
                  {{ formatPrice(pipe.pricePerMeter) }}
                </span>
                <span class="text-grey-7 text-body2">/meter</span>
              </div>

              <div v-if="pipe.description" class="text-grey-7 text-body2 q-mb-md description-clamp">
                {{ pipe.description }}
              </div>

              <q-btn
                @click="handleBuyClick(pipe)"
                :disable="pipe.status !== 'Aktif' || pipe.stock === 0"
                :color="pipe.status === 'Aktif' && pipe.stock > 0 ? 'primary' : 'grey-5'"
                :label="pipe.status !== 'Aktif' || pipe.stock === 0 ? 'Tidak Tersedia' : 'Beli Sekarang'"
                class="full-width q-py-sm rounded-borders text-weight-bold"
                unelevated
                :push="pipe.status === 'Aktif' && pipe.stock > 0"
              >
                <q-icon v-if="pipe.status === 'Aktif' && pipe.stock > 0" name="shopping_cart" class="q-mr-sm" />
              </q-btn>
            </q-card-section>
          </q-card>
        </div>

        <!-- No Search Results State -->
        <div v-if="filteredPipes.length === 0 && pipes.length > 0" class="text-center q-py-xl">
          <q-icon name="search_off" size="xl" color="grey-4" class="q-mb-md" />
          <div class="text-h5 text-weight-semibold text-grey-9 q-mb-sm">Tidak Ada Hasil Ditemukan</div>
          <div class="text-body1 text-grey-7">Coba ubah kata kunci pencarian atau filter Anda.</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useCartStore } from 'src/stores/cart'; // Pastikan path ini benar
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi

// Pastikan file src/url/index.js Anda mengekspor BE_PRE_URL sebagai default export.
import BE_PRE_URL from 'src/url/index.js';

// Inisialisasi Quasar instance
const $q = useQuasar();
const router = useRouter();
const cartStore = useCartStore();

// Reactive states
const loading = ref(true);
const error = ref(null);
const pipes = ref([]);
const searchQuery = ref('');
const filterType = ref('');
const filterStatus = ref('');

// Computed properties
const availablePipes = computed(() => {
  return pipes.value.filter(pipe => pipe.status === 'Aktif' && pipe.stock > 0).length;
});

const uniqueTypes = computed(() => {
  const types = [...new Set(pipes.value.map(pipe => pipe.pipeType))];
  return types.length;
});

const averagePrice = computed(() => {
  if (pipes.value.length === 0) return 0;
  const total = pipes.value.reduce((sum, pipe) => sum + pipe.pricePerMeter, 0);
  return Math.round(total / pipes.value.length);
});

const filteredPipes = computed(() => {
  let filtered = pipes.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(pipe =>
      pipe.pipeName.toLowerCase().includes(query) ||
      pipe.pipeType.toLowerCase().includes(query) ||
      pipe.material.toLowerCase().includes(query) ||
      (pipe.description && pipe.description.toLowerCase().includes(query))
    );
  }

  // Filter by type
  if (filterType.value) {
    filtered = filtered.filter(pipe => pipe.pipeType === filterType.value);
  }

  // Filter by status
  if (filterStatus.value) {
    filtered = filtered.filter(pipe => pipe.status === filterStatus.value);
  }

  return filtered;
});

// Methods
const fetchPipes = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Menggunakan BE_PRE_URL yang sudah dikonfigurasi
    const response = await axios.get(`http://${BE_PRE_URL}/pipa`);
    pipes.value = response.data;
  } catch (err) {
    console.error('Fetch pipes error:', err);
    error.value = err.response?.data?.message || `Gagal memuat data pipa. Pastikan backend berjalan dan dapat diakses di http://${BE_PRE_URL}/pipa. Cek konsol browser untuk detail lebih lanjut.`;
    // Mengganti alert dengan $q.notify
    $q.notify({
      type: 'negative',
      message: error.value,
      position: 'top',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
};

// Menggunakan warna Quasar untuk badge status
const getStatusBadgeColor = (status) => {
  const colors = {
    'Aktif': 'green-8',
    'Tidak Aktif': 'red-8',
    'Habis Stok': 'yellow-8'
  };
  return colors[status] || 'grey-7';
};

// Menggunakan warna Quasar untuk badge type
const getTypeBadgeColor = (type) => {
  const colors = {
    'PVC': 'blue-8',
    'HDPE': 'green-8',
    'PPR': 'purple-8',
    'Besi': 'grey-8',
    'Lainnya': 'orange-8'
  };
  return colors[type] || 'grey-7';
};

// handleBuyClick yang disesuaikan untuk Quasar notify
const handleBuyClick = (pipe) => {
  if (pipe.status === 'Aktif' && pipe.stock > 0) {
    const productForCart = {
      _id: pipe._id,
      name: pipe.pipeName,
      price: pipe.pricePerMeter,
      imageUrl: pipe.imageUrl,
      stock: pipe.stock,
      diameter: pipe.diameter,
      length: pipe.length,
      pipeClass: pipe.pipeClass,
      material: pipe.material,
      color: pipe.color,
    };

    cartStore.addToCart(productForCart, 1);

    $q.notify({
      type: 'positive',
      message: `"${pipe.pipeName}" telah ditambahkan ke keranjang!`,
      position: 'top',
      timeout: 1500
    });

    router.push({ path: '/cart' });
  } else {
    $q.notify({
      type: 'warning',
      message: `Produk "${pipe.pipeName}" tidak tersedia untuk dibeli.`,
      position: 'top',
      timeout: 2000
    });
  }
};

// Lifecycle hook
onMounted(() => {
  fetchPipes();
  cartStore.loadCartFromLocalStorage();
});
</script>

<style scoped>
/* Hero Section Styling */
.hero-section {
  background: linear-gradient(to right, var(--q-color-blue-7), var(--q-color-indigo-8));
  position: relative;
  overflow: hidden; /* For any potential background patterns */
}

.hero-background-image {
  background-image: url('https://placehold.co/1920x600/1A237E/E8EAF6?text=Katalog Pipa'); /* Gambar latar belakang */
  background-size: cover;
  background-position: center;
  background-attachment: fixed; /* Efek parallax ringan */
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Overlay gelap transparan */
  z-index: 1;
}

.hero-padding {
  padding-top: 120px;
  padding-bottom: 120px;
}

/* Text Shadow for Hero Title */
.text-shadow-lg {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-fade-in.delay-200 {
  animation-delay: 0.2s;
}

.animate-fade-in.delay-400 {
  animation-delay: 0.4s;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-scale-in {
  animation: scaleIn 0.4s ease-out forwards;
  /* Add staggered delay for each card if desired, e.g., using v-for index */
}

/* Hero Chips */
.hero-chip {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.hero-chip:hover {
  transform: translateY(-3px); /* Lift effect on hover */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Deeper shadow on hover */
}

/* Stat Cards */
.stat-card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-5px); /* Lift effect */
}

/* Filter Card */
.filter-card {
  border: 1px solid var(--q-color-grey-3); /* Subtle border */
}

/* Product Cards */
.product-card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.product-card:hover {
  transform: translateY(-8px); /* More pronounced lift */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Deeper shadow */
}

.product-image {
  height: 180px; /* Consistent image height */
  width: 100%; /* Ensure it fills the width */
  object-fit: cover;
}

.product-name-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 50px; /* Ensure consistent height for names */
  line-height: 1.3;
}

.description-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Limit to 3 lines for description */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 60px; /* Ensure consistent height */
  line-height: 1.4;
}
</style>
