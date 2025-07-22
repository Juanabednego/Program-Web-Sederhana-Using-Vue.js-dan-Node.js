<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="cancel">
    <div class="modal-content">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button @click="confirm" class="btn btn-confirm">Lanjutkan</button>
        <button @click="cancel" class="btn btn-cancel">Batalkan</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // Properti untuk mengontrol visibilitas modal
    isVisible: {
      type: Boolean,
      default: false
    },
    // Judul modal (opsional)
    title: {
      type: String,
      default: 'Konfirmasi Aksi'
    },
    // Pesan yang akan ditampilkan dalam modal
    message: {
      type: String,
      default: 'Apakah Anda yakin ingin melanjutkan?'
    }
  },
  methods: {
    // Dipanggil saat tombol "Lanjutkan" diklik
    confirm() {
      this.$emit('confirmed'); // Mengirim event 'confirmed' ke parent
    },
    // Dipanggil saat tombol "Batalkan" diklik atau klik di luar modal
    cancel() {
      this.$emit('canceled'); // Mengirim event 'canceled' ke parent
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* Overlay gelap semi-transparan */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Pastikan di atas konten lain */
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  text-align: center;
  transform: translateY(-20px); /* Efek masuk ringan */
  animation: modal-in 0.3s forwards ease-out;
}

@keyframes modal-in {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title {
  margin-top: 0;
  color: #333;
  font-size: 1.5em;
  margin-bottom: 15px;
}

.modal-message {
  color: #555;
  font-size: 1.1em;
  margin-bottom: 25px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px; /* Jarak antar tombol */
}

.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease;
}

.btn-confirm {
  background-color: #28a745; /* Hijau untuk Lanjutkan */
  color: white;
}

.btn-confirm:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #dc3545; /* Merah untuk Batalkan */
  color: white;
}

.btn-cancel:hover {
  background-color: #c82333;
}
</style> 