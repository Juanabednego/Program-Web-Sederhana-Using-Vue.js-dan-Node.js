// src/router/routes.js
// Ini hanya untuk definisi rute. Import Vue Router tidak diperlukan di sini.

// Import Layouts Quasar yang akan digunakan
import MainLayout from 'src/layouts/MainLayout.vue';
// Anda mungkin perlu membuat AuthLayout.vue atau EmptyLayout.vue di src/layouts/
// jika halaman login/register/publik tidak menggunakan header/sidebar utama.
// Contoh:
import AuthLayout from 'src/layouts/AuthLayout.vue'; // Misal untuk login/register
import EmptyLayout from 'src/layouts/EmptyLayout.vue'; // Untuk halaman tanpa layout sama sekali (misal, 404, token invalid)
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'; // Halaman 404 default Quasar - DIUNCOMMENT

// Import semua View Anda dari proyek lama, disesuaikan path ke src/pages/
// Kita akan tetap menggunakan nama import asli Anda untuk saat ini.
// SANGAT DIREKOMENDASIKAN menggunakan lazy loading untuk semua komponen halaman.
const routes = [
  // Halaman yang mungkin tidak menggunakan MainLayout (Login, Register, Publik murni)
  {
    path: '/',
    component: EmptyLayout, // Atau AuthLayout jika ada struktur untuk halaman otentikasi
    children: [
      {
        path: '', // Rute root untuk EmptyLayout
        name: 'Login',
        component: () => import('src/pages/auth/Login.vue'), // Path disesuaikan ke src/pages/
        meta: { guestOnly: true }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('src/pages/auth/Register.vue'), // Path disesuaikan ke src/pages/
        meta: { guestOnly: true }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('src/pages/About.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'forbidden',
        name: 'Forbidden',
        component: () => import('src/pages/Forbidden.vue'),
        meta: { requiresAuth: false }
      },
      // --- START NEW ROUTES FOR EMAIL INVOICE ---
      {
        path: 'confirm-payment', // Contoh: /confirm-payment?orderId=xxx&token=yyy
        name: 'confirmPayment',
        component: () => import('src/pages/ConfirmPaymentView.vue'),
        meta: { requiresAuth: false, isPublicWithToken: true },
        props: (route) => ({ orderId: route.query.orderId, token: route.query.token })
      },
      {
        path: 'token-invalid',
        name: 'tokenInvalid',
        component: () => import('src/pages/TokenInvalidView.vue'),
        meta: { requiresAuth: false, isPublic: true }
      },
      // --- END NEW ROUTES FOR EMAIL INVOICE ---
    ]
  },

  // Rute-rute yang menggunakan MainLayout (Admin dan Customer)
  // Semua rute yang memerlukan header, sidebar, atau footer umum harus berada di sini.
  {
    path: '/', // Path dasar untuk MainLayout. Rute anak akan memiliki path relatif.
    component: MainLayout,
    children: [
      // Halaman untuk admin
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('src/pages/features/Dashboard.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'update/:id',
        name: 'UpdateUser',
        component: () => import('src/pages/features/UpdateUser.vue'),
        props: true,
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'detail/:id',
        name: 'Detail',
        component: () => import('src/pages/Detail.vue'),
        props: true,
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'kelola-pipa',
        name: 'KelolaPipa',
        component: () => import('src/pages/KelolaPipa/IndexKelolaPipa.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'update-pipa/:id',
        name: 'UpdatePipa',
        component: () => import('src/pages/KelolaPipa/UpdatePipa.vue'),
        props: true,
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'tambah-pipa',
        name: 'tambah-pipa',
        component: () => import('src/pages/KelolaPipa/CreatePipa.vue'),
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: 'purchases',
        name: 'ManagePurchases',
        component: () => import('src/pages/features/ManagePurchasesPage.vue'),
        meta: { requiresAuth: true, roles: ['admin'] }
      },
      {
        path: 'purchases/:id',
        name: 'PurchaseDetail',
        component: () => import('src/pages/features/PurchaseDetailPage.vue'),
        props: true,
        meta: { requiresAuth: true, roles: ['admin'] }
      },

      // Halaman untuk customer
      {
        path: 'customer-page',
        name: 'CustomerPage',
        component: () => import('src/pages/CustomerPage.vue'),
        meta: { requiresAuth: true, roles: ['customer'] }
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('src/pages/Home.vue'),
        meta: { requiresAuth: true, roles: ['customer'] }
      },
      {
        path: 'cart',
        name: 'cart',
        component: () => import('src/pages/CartView.vue'),
        meta: { requiresAuth: true, roles: ['customer'] }
      },
      {
        path: 'pemesanan',
        name: 'pemesanan',
        component: () => import('src/pages/Pemesanan.vue'),
        meta: { requiresAuth: true, roles: ['customer'] }
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('src/pages/CheckoutView.vue'),
        meta: { requiresAuth: true, roles: ['customer'] }
      },
      {
        path: 'order-confirmation/:orderId',
        name: 'orderConfirmation',
        component: () => import('src/pages/OrderConfirmationView.vue'),
        props: true,
        meta: { requiresAuth: true, roles: ['customer'] }
      },
    ]
  },

  // Rute Catch-all (404 Not Found)
  // Selalu biarkan ini sebagai rute terakhir dalam array.
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFound // DIUNCOMMENT
  }
];

export default routes;
