// src/router/index.js
import { route } from 'quasar/wrappers';
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';

// Impor definisi rute dari file routes.js yang baru Anda buat/modifikasi
import routes from './routes';

// Import NProgress (pastikan sudah diinstal: npm install nprogress atau yarn add nprogress)
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Pastikan CSS NProgress terimport

/*
 * Jika tidak membangun dengan SSR (server side rendering):
 * Anda dapat langsung mengekspor instansi Router;
 *
 * Fungsi di bawah ini juga bisa asynchronous; gunakan async/await atau kembalikan Promise
 *
 * Jika membangun dengan SSR, Anda harus mengekspor fungsi yang mengembalikan Promise
 * fungsi di bawah ini sudah dicakup oleh wrapper "async" Quasar
 */

export default route(function ({ store /*, ssrContext */ }) {
  // Pilih mode history berdasarkan env.VUE_ROUTER_MODE di quasar.conf.js
  // Default Quasar adalah history mode (createWebHistory)
  const createHistory = process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    // Konfigurasi scroll behavior untuk kembali ke atas halaman saat navigasi
    scrollBehavior: (to, from, savedPosition) => {
      if (savedPosition) {
        return savedPosition;
      } else {
        return { left: 0, top: 0 };
      }
    },
    routes, // Menggunakan definisi rute yang diimpor dari routes.js

    // Pastikan server Anda memungkinkan History API (jika menggunakan createWebHistory)
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // --- START NAVIGATION GUARDS ---
  Router.beforeEach(async (to, from, next) => {
    NProgress.start(); // Mulai progress bar

    // Ambil status login dan peran.
    // Asumsi Anda akan mengelola ini melalui Pinia/Vuex Store atau semacamnya di Quasar.
    // Untuk saat ini, kita tetap menggunakan localStorage sesuai kode asli Anda.
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('jwt');
    const role = localStorage.getItem('role');

    // 1. Handle guestOnly routes (login/register)
    if (to.meta.guestOnly) {
      if (isLoggedIn) {
        NProgress.done();
        // Redirect berdasarkan peran jika sudah login
        return role === 'admin' ? next({ name: 'Dashboard' }) : next({ name: 'Home' });
      }
      return next(); // Lanjutkan ke halaman login/register jika belum login
    }

    // 2. Handle public routes (About, Forbidden, ConfirmPayment, TokenInvalid)
    // These routes don't require authentication
    if (to.meta.isPublic || to.meta.isPublicWithToken) {
      return next(); // Lanjutkan tanpa cek otentikasi
    }

    // 3. Handle routes that require authentication
    if (to.meta.requiresAuth) {
      if (!isLoggedIn || !token) {
        NProgress.done();
        return next({ name: 'Login' }); // Redirect ke login jika tidak terautentikasi
      }

      // 4. Handle role-based access control
      if (to.meta.roles && !to.meta.roles.includes(role)) {
        NProgress.done();
        return next({ name: 'Forbidden' }); // Redirect ke Forbidden page jika peran tidak sesuai
      }
    }

    next(); // Lanjutkan navigasi normal
  });

  Router.afterEach(() => {
    NProgress.done(); // Selesaikan progress bar setelah navigasi selesai
  });
  // --- END NAVIGATION GUARDS ---

  return Router;
});