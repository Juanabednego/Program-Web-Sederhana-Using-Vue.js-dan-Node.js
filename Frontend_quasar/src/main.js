import { createApp } from 'vue';
import { Quasar, Dialog, Notify } from 'quasar'; 


import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import 'quasar/src/css/app.scss';


import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router'; 

const app = createApp(App);


app.use(createPinia()); 
app.use(router);

app.use(Quasar, {
  plugins: {
    Dialog, 
    Notify  
  },
  config: {
   
    //         brand: { primary: '#1976D2', ... }
  }
});

app.mount('#app');
