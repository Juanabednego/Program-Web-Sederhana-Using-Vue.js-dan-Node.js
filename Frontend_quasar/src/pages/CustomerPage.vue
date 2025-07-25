<!-- src/pages/CustomerPage.vue -->
<template>
  <!-- q-page sebagai pembungkus utama untuk halaman, dengan latar belakang abu-abu terang Quasar -->
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <!-- q-card sebagai kontainer utama untuk konten, memberikan tampilan yang rapi dengan shadow dan sudut membulat -->
    <q-card class="q-pa-lg shadow-lg rounded-borders text-center" style="width: 100%; max-width: 700px;">
      <q-card-section>
        <!-- Menggunakan kelas tipografi Quasar untuk judul -->
        <div class="text-h4 text-weight-bold text-primary q-mb-md">Halaman Customer</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- Menggunakan kelas tipografi Quasar untuk paragraf -->
        <p class="text-body1 text-grey-8">
          Selamat datang di halaman khusus customer. Di sini Anda dapat melihat fitur-fitur yang hanya dapat diakses oleh customer.
        </p>
        <p class="text-body2 text-grey-7 q-mt-md">
          Nikmati pengalaman berbelanja pipa berkualitas tinggi dengan fitur-fitur eksklusif kami.
        </p>
      </q-card-section>

      <q-card-actions align="center" class="q-pt-md">
        <!-- Contoh tombol navigasi ke halaman produk atau pesanan -->
        <q-btn
          label="Lihat Produk Pipa"
          color="primary"
          to="/home"
          unelevated
          class="q-px-lg q-py-md"
        />
        <q-btn
          label="Riwayat Pesanan Saya"
          color="grey-7"
          to="/pemesanan"
          unelevated
          class="q-px-lg q-py-md"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
// Tidak ada logika JavaScript yang kompleks diperlukan untuk halaman statis ini.
// Jika Anda perlu navigasi, pastikan useRouter diimpor.
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
/* Anda dapat menambahkan gaya kustom di sini jika diperlukan.
   Sebagian besar styling sudah ditangani oleh komponen Quasar dan kelas utilitasnya. */
</style>
