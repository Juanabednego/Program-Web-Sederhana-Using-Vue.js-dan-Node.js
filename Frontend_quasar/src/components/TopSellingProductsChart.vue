<!-- src/components/TopSellingProductsChart.vue -->
<template>
  <q-card class="shadow-lg rounded-borders q-pa-md" style="min-height: 450px;">
    <q-card-section>
      <div class="text-h5 text-weight-bold text-grey-9 q-mb-md text-center">Produk Terlaris</div>
    </q-card-section>

    <!-- Loading State -->
    <q-card-section v-if="isLoadingChart" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="3em" class="q-mb-md" />
      <div class="text-h6 text-grey-7">Memuat data produk terlaris...</div>
    </q-card-section>

    <!-- Error State -->
    <q-card-section v-else-if="chartError">
      <q-banner class="bg-red-1 text-red-8 rounded-borders q-pa-md">
        <template v-slot:avatar>
          <q-icon name="error" color="red-4" />
        </template>
        <div class="text-body1 text-weight-bold">{{ chartError }}</div>
      </q-banner>
    </q-card-section>

    <!-- No Data State -->
    <q-card-section v-else-if="chartData.labels.length === 0" class="text-center q-py-xl">
      <q-icon name="bar_chart" size="xl" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-7">Tidak ada data produk terlaris untuk ditampilkan.</div>
      <p class="text-body1 text-grey-6">Pastikan ada pesanan yang sudah 'Delivered' atau 'Completed'.</p>
    </q-card-section>

    <!-- Chart Display -->
    <q-card-section v-else class="chart-wrapper">
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar'; 

import BE_PRE_URL from 'src/url/index.js';

// Import komponen Bar dari vue-chartjs
import { Bar } from 'vue-chartjs';

// Import dan daftarkan elemen-elemen Chart.js yang dibutuhkan
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const $q = useQuasar(); // Inisialisasi Quasar instance

const chartData = ref({
  labels: [], // Akan diisi dengan nama produk
  datasets: [
    {
      label: 'Total Kuantitas Terjual', // Label untuk legend dan tooltip
      backgroundColor: '#2196F3', // Warna batang biru Quasar primary
      borderColor: '#2196F3',
      borderWidth: 1,
      data: [] // Akan diisi dengan kuantitas terjual
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false, // Penting agar tinggi dan lebar bisa dikontrol oleh CSS
  plugins: {
    legend: {
      display: true, // Tampilkan legend
      position: 'top',
      labels: {
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      },
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y + ' unit'; // Menambahkan 'unit' pada tooltip
          }
          return label;
        }
      }
    },
    title: {
      display: true,
      text: 'Berdasarkan Kuantitas Terjual', // Sub-judul grafik
      font: {
        size: 16,
        weight: 'bold'
      },
      padding: {
        top: 10,
        bottom: 20
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true, // Mulai sumbu Y dari nol
      title: {
        display: true,
        text: 'Jumlah', // Label sumbu Y
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      ticks: {
        precision: 0, // Pastikan nilai sumbu Y adalah bilangan bulat (untuk kuantitas)
        font: {
          size: 10
        }
      }
    },
    x: {
      title: {
        display: true,
        text: 'Nama Produk', // Label sumbu X
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
});

const isLoadingChart = ref(true); // State untuk menunjukkan apakah data chart sedang dimuat
const chartError = ref(null); // State untuk pesan error chart

const fetchTopProducts = async () => {
  isLoadingChart.value = true;
  chartError.value = null; // Reset error state
  try {
    const token = localStorage.getItem('jwt'); // Ambil token dari localStorage

    if (!token) {
      chartError.value = 'Token otentikasi tidak ditemukan. Harap login.';
      $q.notify({
        type: 'negative',
        message: 'Token otentikasi tidak ditemukan. Harap login.',
        position: 'top',
        timeout: 3000
      });
      isLoadingChart.value = false;
      return;
    }

    const response = await axios.get(`http://${BE_PRE_URL}/orders/top-selling-products`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = response.data;

    if (data && data.length > 0) {
      chartData.value.labels = data.map(item => item._id); // _id adalah nama produk dari agregasi
      chartData.value.datasets[0].data = data.map(item => item.totalQuantitySold); // totalQuantitySold dari agregasi
    } else {
      chartData.value.labels = [];
      chartData.value.datasets[0].data = [];
    } 

  } catch (error) {
    console.error('Gagal mengambil data produk terlaris:', error);
    let errorMessage = 'Terjadi kesalahan saat memuat data produk terlaris.';
    if (error.response) {
      errorMessage = `Gagal memuat data: ${error.response.status} - ${error.response.data.message || error.message}`;
      if (error.response.status === 401 || error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk melihat data ini. Silakan login ulang.';
        
      }
    } else if (error.request) {
      errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi backend Anda.';
    } else {
      errorMessage = 'Terjadi kesalahan tidak terduga: ' + error.message;
    }
    chartError.value = errorMessage;
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 3000
    });
  } finally {
    isLoadingChart.value = false;
  }
};

onMounted(() => {
  fetchTopProducts(); // Panggil fungsi saat komponen dimuat
});
</script>

<style scoped>
/* Wrapper untuk chart agar bisa mengontrol dimensi */
.chart-wrapper {
  width: 100%;
  height: 300px; /* Sesuaikan tinggi chart di sini */
  position: relative; /* Penting untuk Bar component */
}
</style>
