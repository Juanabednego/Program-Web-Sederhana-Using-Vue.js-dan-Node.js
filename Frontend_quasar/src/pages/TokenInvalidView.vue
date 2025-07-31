<template>
  <q-page class="flex flex-center bg-grey-2">
   
    <q-card class="q-pa-md shadow-lg rounded-borders text-center q-mt-xl" style="max-width: 450px;">
      <q-card-section>
        <div class="text-h4 text-negative q-mb-md">Tautan Tidak Valid atau Kedaluwarsa</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p class="text-body1 text-grey-8 q-mb-md">
          Mohon maaf, tautan konfirmasi pembayaran yang Anda gunakan tidak valid, sudah kedaluwarsa, atau terjadi kesalahan.
        </p>
        
        <p class="text-body2 text-grey-7 q-mb-md">
          Silakan periksa kembali email Anda untuk tautan terbaru, atau hubungi dukungan pelanggan jika Anda mengalami masalah.
        </p>
      </q-card-section>

      <q-card-actions align="center">
      
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
import { defineComponent } from 'vue'; 

export default defineComponent({
  name: 'TokenInvalidView'
});
</script>

<style scoped>

</style>
