<!-- src/pages/TokenInvalidView.vue -->
<template>
  <!-- q-page sebagai pembungkus utama untuk halaman, dengan utilitas flexbox Quasar -->
  <!-- bg-grey-2 adalah warna latar belakang abu-abu terang Quasar, mirip dengan bg-gray-100 -->
  <q-page class="flex flex-center bg-grey-2">
    <!-- q-card sebagai pengganti div dengan shadow, rounded-lg, dan padding -->
    <!-- q-pa-md untuk padding, shadow-lg untuk bayangan, rounded-borders untuk sudut membulat -->
    <!-- text-center untuk teks di tengah, q-mt-xl untuk margin-top -->
    <q-card class="q-pa-md shadow-lg rounded-borders text-center q-mt-xl" style="max-width: 450px;">
      <q-card-section>
        <!-- Menggunakan kelas tipografi Quasar untuk judul (text-h4 mirip 3xl) -->
        <!-- text-negative adalah warna merah bawaan Quasar, q-mb-md untuk margin-bottom -->
        <div class="text-h4 text-negative q-mb-md">Tautan Tidak Valid atau Kedaluwarsa</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- Menggunakan kelas tipografi Quasar untuk paragraf (text-body1 mirip text-lg) -->
        <!-- text-grey-8 adalah warna teks abu-abu gelap Quasar, q-mb-md untuk margin-bottom -->
        <p class="text-body1 text-grey-8 q-mb-md">
          Mohon maaf, tautan konfirmasi pembayaran yang Anda gunakan tidak valid, sudah kedaluwarsa, atau terjadi kesalahan.
        </p>
        <!-- text-grey-7 adalah warna teks abu-abu sedang Quasar -->
        <p class="text-body2 text-grey-7 q-mb-md">
          Silakan periksa kembali email Anda untuk tautan terbaru, atau hubungi dukungan pelanggan jika Anda mengalami masalah.
        </p>
      </q-card-section>

      <q-card-actions align="center">
        <!-- q-btn sebagai pengganti router-link yang distyling -->
        <!-- color="primary" untuk warna biru bawaan Quasar, label untuk teks tombol -->
        <!-- to="/" untuk navigasi, q-mt-lg untuk margin-top -->
        <q-btn
          color="primary"
          label="Kembali ke Halaman Utama"
          to="/"
          unelevated
          class="q-mt-lg"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'; // Direkomendasikan untuk Options API di Vue 3

export default defineComponent({
  name: 'TokenInvalidView'
});
</script>

<style scoped>
/*
  Sebagian besar styling sekarang ditangani oleh komponen Quasar dan kelas utilitasnya.
  Anda dapat menambahkan gaya khusus di sini jika diperlukan, tetapi untuk tampilan ini
  seharusnya tidak banyak yang dibutuhkan.
*/
</style>
