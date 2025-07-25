<!-- src/pages/Forbidden.vue -->
<template>
  <!-- q-page sebagai pembungkus utama untuk halaman, dengan utilitas flexbox Quasar -->
  <q-page class="flex flex-center bg-grey-2">
    <!-- q-card sebagai pengganti div dengan shadow dan rounded-lg -->
    <q-card class="q-pa-lg shadow-lg rounded-borders text-center" style="max-width: 450px;">
      <q-card-section>
        <!-- Menggunakan kelas tipografi Quasar untuk judul -->
        <div class="text-h4 text-weight-bold text-negative q-mb-md">Akses Ditolak</div>
        <q-icon name="block" size="xl" color="negative" class="q-mb-md" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- Menggunakan kelas tipografi Quasar untuk paragraf -->
        <p class="text-body1 text-grey-8 q-mb-md">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <p class="text-body2 text-grey-7">Silakan kembali ke halaman sebelumnya atau login dengan akun yang memiliki izin.</p>
      </q-card-section>

      <q-card-actions align="center">
        <!-- q-btn untuk tombol kembali, menggunakan router.push -->
        <q-btn
          label="Kembali ke Halaman Login"
          color="primary"
          @click="goBack"
          unelevated
          class="q-mt-md"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi (opsional, tapi bagus untuk konsistensi)

const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance

// Logika ini dipindahkan ke fungsi logout atau navigation guard.
// Menghapus window.location.replace('/') langsung di setup()
// karena ini bisa menyebabkan reload yang tidak perlu atau loop.
// const logout = localStorage.getItem('logout');
// if (logout) {
//   window.location.replace('/');
// }

const goBack = () => {
  // Bersihkan localStorage untuk memastikan status login direset
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('role');
  localStorage.removeItem('jwt');
  localStorage.removeItem('user_id'); // Pastikan user_id juga dihapus
  localStorage.removeItem('userData'); // Pastikan userData juga dihapus
  localStorage.setItem('logout', 'true'); // Set flag logout

  // Menggunakan router.push untuk navigasi yang lebih mulus di Vue/Quasar
  // dan kemudian reload untuk memastikan state aplikasi bersih
  router.push('/').then(() => {
    window.location.reload();
  });

  // Atau, jika Anda hanya ingin kembali ke halaman sebelumnya tanpa logout penuh:
  // router.go(-1);
  // Atau, untuk kembali ke home jika tidak ada history:
  // router.push('/home');

  // Notifikasi opsional
  $q.notify({
    type: 'info',
    message: 'Anda telah dialihkan ke halaman login.',
    position: 'top',
    timeout: 2000
  });
};
</script>

<style scoped>
/* Anda dapat menambahkan gaya kustom di sini jika diperlukan,
   tetapi sebagian besar styling sudah ditangani oleh kelas utilitas Quasar. */
.border-b-grey-3 {
  border-bottom: 1px solid #e0e0e0; /* Quasar's grey-3 */
}
</style>
