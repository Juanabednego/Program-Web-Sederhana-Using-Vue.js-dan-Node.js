<template>
  <div class="chart-container bg-white rounded-md shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4 text-center">Top 7 Produk Terlaris</h2>

    <div v-if="isLoadingChart" class="flex items-center justify-center h-full text-blue-600 font-semibold">
      <svg class="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Memuat data produk terlaris...
    </div>

    <div v-else-if="chartError" class="text-center py-6 text-red-500 font-semibold">
      {{ chartError }}
    </div>

    <div v-else-if="chartData.labels.length === 0" class="text-center py-6 text-gray-500">
      Tidak ada data produk terlaris untuk ditampilkan. Pastikan ada pesanan yang sudah 'Delivered' atau 'Completed'.
    </div>

    <div v-else class="h-80">
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import BE_PRE_URL from '../url/index.js'; // Ini tetap 'localhost:9001/api/v1'

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

const chartData = ref({
  labels: [], // Akan diisi dengan nama produk
  datasets: [
    {
      label: 'Total Kuantitas Terjual', // Label untuk legend dan tooltip
      backgroundColor: '#4CAF50', // Warna batang hijau
      borderColor: '#4CAF50',
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
        text: 'Jumlah Kuantitas', // Label sumbu Y
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
      isLoadingChart.value = false;
      return;
    }

    // === PERBAIKAN URL DI SINI ===
    // Menghapus '/api/' ganda karena BE_PRE_URL sudah mengandung '/api/v1'
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
    if (error.response) {
      chartError.value = `Gagal memuat data: ${error.response.status} - ${error.response.data.message || error.message}`;
      if (error.response.status === 401 || error.response.status === 403) {
        chartError.value = 'Anda tidak memiliki izin untuk melihat data ini. Silakan login ulang.';
        // Redirect atau logout jika tidak diotorisasi
      }
    } else if (error.request) {
      chartError.value = 'Tidak dapat terhubung ke server. Periksa koneksi backend Anda.';
    } else {
      chartError.value = 'Terjadi kesalahan tidak terduga: ' + error.message;
    }
  } finally {
    isLoadingChart.value = false;
  }
};

onMounted(() => {
  fetchTopProducts(); // Panggil fungsi saat komponen dimuat
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 450px; /* Atur tinggi container chart */
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.chart-container > div.h-80 {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>