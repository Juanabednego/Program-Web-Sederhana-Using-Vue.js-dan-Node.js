// src/main.js
import { createApp } from 'vue';
// Pastikan Anda mengimpor Dialog dan Notify dari 'quasar'
import { Quasar, Dialog, Notify } from 'quasar'; 

// Import Quasar css
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

// Import Pinia (jika Anda menggunakannya)
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router'; // Pastikan path ke router Anda benar

const app = createApp(App);

// Gunakan Pinia jika Anda menggunakannya
app.use(createPinia()); 
app.use(router);

app.use(Quasar, {
  plugins: {
    Dialog, // <<< INI SANGAT PENTING untuk $q.dialog
    Notify  // <<< INI PENTING untuk $q.notify (notifikasi pop-up)
  },
  config: {
    // Anda bisa menambahkan konfigurasi Quasar global lainnya di sini jika ada
    // Contoh: iconSet: 'material-icons',
    //         brand: { primary: '#1976D2', ... }
  }
});

app.mount('#app');
