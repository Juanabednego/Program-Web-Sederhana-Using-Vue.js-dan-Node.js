<template>
  <div class="container mx-auto p-4 bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white shadow-lg rounded-lg p-8 text-center mt-10">
      <h1 class="text-3xl font-bold text-red-600 mb-4">Tautan Tidak Valid atau Kedaluwarsa</h1>
      <p class="text-lg text-gray-700 mb-6">
        Mohon maaf, tautan konfirmasi pembayaran yang Anda gunakan tidak valid, sudah kedaluwarsa, atau terjadi kesalahan.
      </p>
      <p class="text-gray-600 mb-6">
        Silakan periksa kembali email Anda untuk tautan terbaru, atau hubungi dukungan pelanggan jika Anda mengalami masalah.
      </p>
      <router-link to="/" class="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
        Kembali ke Halaman Utama
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TokenInvalidView'
}
</script>

<style scoped>
/* Tambahkan gaya CSS kustom di sini */
</style>
