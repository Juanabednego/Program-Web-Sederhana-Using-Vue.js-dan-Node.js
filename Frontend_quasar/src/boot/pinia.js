// src/boot/pinia.js
import { createPinia } from 'pinia';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  // Buat instance Pinia
  const pinia = createPinia();

  // Daftarkan Pinia ke aplikasi Vue
  app.use(pinia);

  // Anda bisa menambahkan store Pinia ke app.config.globalProperties jika diperlukan
  // app.config.globalProperties.$store = pinia;
});