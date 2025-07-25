<!-- src/pages/Detail.vue -->
<template>
  <!-- q-page sebagai pembungkus utama untuk halaman, dengan utilitas flexbox Quasar -->
  <q-page class="q-pa-md bg-grey-2 flex flex-center">
    <!-- q-card sebagai kontainer utama untuk detail, dengan shadow dan rounded-borders -->
    <q-card class="q-pa-lg shadow-lg rounded-borders" style="width: 100%; max-width: 600px;">
      <q-card-section class="text-center">
        <!-- Menggunakan kelas tipografi Quasar untuk judul -->
        <div class="text-h4 text-weight-bold text-primary q-mb-md">Halaman Detail</div>
        <p class="text-body1 text-grey-8"><strong>ID dari URL:</strong> {{ id }}</p>
      </q-card-section>

      <q-separator inset />

      <q-card-section class="q-pt-md">
        <!-- Menggunakan kelas tipografi Quasar untuk informasi query -->
        <p class="text-body1 text-grey-8 q-mb-sm"><strong>Nama (query):</strong> {{ route.query.nama }}</p>
        <p class="text-body1 text-grey-8 q-mb-sm"><strong>Tags (array):</strong> {{ route.query.tags }}</p>
        <p class="text-body1 text-grey-8 q-mb-sm"><strong>Info (object):</strong></p>
        <!-- Menggunakan q-card atau div dengan styling untuk menampilkan JSON yang diparsing -->
        <q-card flat bordered class="q-pa-sm bg-grey-1 text-grey-9 q-mt-sm">
          <pre class="q-ma-none text-body2">{{ parsedInfo }}</pre>
        </q-card>
      </q-card-section>

      <q-card-actions align="right" class="q-pt-md">
        <!-- Tombol kembali ke halaman sebelumnya -->
        <q-btn
          label="Kembali"
          color="grey-7"
          @click="router.go(-1)"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'; // Import useRouter
import { computed } from 'vue';

const route = useRoute();
const router = useRouter(); // Inisialisasi useRouter

const id = computed(() => route.params.id);

const parsedInfo = computed(() => {
  try {
    // Pastikan route.query.info adalah string sebelum parsing
    if (typeof route.query.info === 'string' && route.query.info) {
      return JSON.parse(route.query.info);
    }
    return {}; // Kembalikan objek kosong jika info tidak ada atau bukan string
  } catch (e) {
    console.error("Error parsing info query parameter:", e);
    return {}; // Kembalikan objek kosong jika ada error parsing
  }
});
</script>

<style scoped>
/* Anda dapat menambahkan gaya kustom di sini jika diperlukan.
   Sebagian besar styling sudah ditangani oleh komponen Quasar dan kelas utilitasnya. */
</style>
