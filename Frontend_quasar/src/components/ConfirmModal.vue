<!-- src/components/ConfirmationModal.vue -->
<template>
  <q-dialog v-model="internalVisible" persistent>
    <q-card class="q-pa-md" style="width: 100%; max-width: 400px;">
      <q-card-section class="text-center">
        <div class="text-h6 text-weight-bold q-mb-sm">{{ title }}</div>
        <q-separator />
      </q-card-section>

      <q-card-section class="q-pt-none text-center">
        <p class="text-body1 text-grey-8">{{ message }}</p>
      </q-card-section>

      <q-card-actions align="center" class="q-mt-md">
        <q-btn
          label="Lanjutkan"
          color="positive"
          @click="onConfirm"
          unelevated
          class="q-px-md"
        />
        <q-btn
          label="Batalkan"
          color="negative"
          @click="onCancel"
          flat
          class="q-px-md"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Konfirmasi Aksi'
  },
  message: {
    type: String,
    default: 'Apakah Anda yakin ingin melanjutkan?'
  }
});

const emit = defineEmits(['confirmed', 'canceled', 'update:isVisible']);

// Gunakan internalVisible untuk mengontrol v-model QDialog
const internalVisible = ref(props.isVisible);

// Sinkronkan internalVisible dengan prop isVisible
watch(() => props.isVisible, (newVal) => {
  internalVisible.value = newVal;
});

// Sinkronkan internalVisible kembali ke prop isVisible saat dialog ditutup secara internal
watch(internalVisible, (newVal) => {
  if (!newVal) {
    emit('update:isVisible', false);
  }
});

const onConfirm = () => {
  emit('confirmed');
  internalVisible.value = false; // Tutup modal setelah konfirmasi
};

const onCancel = () => {
  emit('canceled');
  internalVisible.value = false; // Tutup modal setelah pembatalan
};
</script>

<style scoped>
/* Tidak ada custom CSS yang diperlukan karena Quasar menangani styling */
</style>
