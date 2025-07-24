import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress' // Import NProgress
import 'nprogress/nprogress.css' // Import CSS untuk styling NProgress

// Import Views
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import Dashboard from '../views/features/Dashboard.vue'
import UpdateUser from '../views/features/UpdateUser.vue'
import Detail from '../views/Detail.vue'
import Home from '../views/Home.vue'
import CustomerPage from '../views/CustomerPage.vue'
import About from '../views/About.vue'
import Forbidden from '../views/Forbidden.vue'
import IndexKelolaPipa from '../views/KelolaPipa/IndexKelolaPipa.vue'
import UpdatePipa from '../views/KelolaPipa/UpdatePipa.vue'
import CreatePipa from '../views/KelolaPipa/CreatePipa.vue'
import CartView from '../views/CartView.vue';
import CheckoutView from '../views/CheckoutView.vue';
import OrderConfirmationView from '../views/OrderConfirmationView.vue';

// Import halaman pengelolaan pembelian (baru)
import ManagePurchasesPage from '../views/features/ManagePurchasesPage.vue';
import PurchaseDetailPage from '../views/features/PurchaseDetailPage.vue';
import Pemesanan from '../views/Pemesanan.vue'

// --- START NEW IMPORTS FOR EMAIL INVOICE ---
import ConfirmPaymentView from '../views/ConfirmPaymentView.vue'; // Ini adalah halaman yang akan menerima token
import TokenInvalidView from '../views/TokenInvalidView.vue'; // Opsional: Halaman untuk token tidak valid
// --- END NEW IMPORTS FOR EMAIL INVOICE ---


const routes = [
  // Halaman Login yang akan dialihkan jika sudah login
  // Logika pengalihan dipindahkan ke beforeEach global untuk konsistensi
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true } // Menandai rute ini hanya untuk tamu (belum login)
  },

  { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },

  // Halaman untuk admin
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, roles: ['admin'] } // Menggunakan requiresAuth dan roles
  },
  {
    path: '/update/:id',
    name: 'UpdateUser',
    component: UpdateUser,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: Detail,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/kelola-pipa',
    name: 'KelolaPipa',
    component: IndexKelolaPipa,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/update-pipa/:id',
    name: 'UpdatePipa',
    component: UpdatePipa,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/tambah-pipa',
    name: 'tambah-pipa',
    component: CreatePipa,
    meta: {
      requiresAuth: true,
      roles: ['admin']
    },
  },
  {
    path: '/purchases', // Rute baru untuk daftar pembelian
    name: 'ManagePurchases',
    component: ManagePurchasesPage,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/purchases/:id', // Rute baru untuk detail pembelian
    name: 'PurchaseDetail',
    component: PurchaseDetailPage,
    props: true,
    meta: { requiresAuth: true, roles: ['admin'] }
  },


  // Halaman untuk customer
  {
    path: '/customer-page',
    name: 'CustomerPage',
    component: CustomerPage,
    meta: { requiresAuth: true, roles: ['customer'] }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true, roles: ['customer'] }
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { requiresAuth: true, roles: ['customer'] }
  },
  {
    path: '/pemesanan',
    name: 'pemesanan',
    component: Pemesanan,
    meta: { requiresAuth: true, roles: ['customer'] }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { requiresAuth: true, roles: ['customer'] }
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'orderConfirmation',
    component: OrderConfirmationView,
    props: true,
    meta: { requiresAuth: true, roles: ['customer'] }
  },

  // Halaman umum
  { path: '/about', name: 'About', component: About, meta: { requiresAuth: false } },

  // Forbidden page
  { path: '/forbidden', name: 'Forbidden', component: Forbidden, meta: { requiresAuth: false } },

  // --- START NEW ROUTES FOR EMAIL INVOICE ---
  {
    path: '/confirm-payment', // Contoh: /confirm-payment?orderId=xxx&token=yyy
    name: 'confirmPayment',
    component: ConfirmPaymentView,
    meta: { requiresAuth: false, isPublicWithToken: true }, // Rute publik, namun dengan validasi token
    props: (route) => ({ orderId: route.query.orderId, token: route.query.token }) // Menerima query params sebagai props
  },
  {
    path: '/token-invalid', // Halaman khusus jika token tidak valid/kadaluarsa
    name: 'tokenInvalid',
    component: TokenInvalidView, // Anda perlu membuat komponen Vue ini
    meta: { requiresAuth: false, isPublic: true } // Tandai sebagai rute publik
  },
  // --- END NEW ROUTES FOR EMAIL INVOICE ---

  {
    path: '/:pathMatch(.*)*', // Catch all undefined routes
    redirect: { name: 'Login' } // Redirect ke halaman Login jika rute tidak ditemukan
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


// Navigation Guard
router.beforeEach((to, from, next) => {
  // Mulai progress bar saat navigasi dimulai
  NProgress.start()

  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const token = localStorage.getItem('jwt')
  const role = localStorage.getItem('role')

  // --- START UPDATED NAVIGATION GUARD LOGIC ---

  // 1. Handle guestOnly routes (login/register)
  if (to.meta.guestOnly) {
    if (isLoggedIn) {
      NProgress.done();
      return role === 'admin' ? next({ name: 'Dashboard' }) : next({ name: 'Home' });
    }
    return next(); // Lanjutkan ke halaman login/register jika belum login
  }

  // 2. Handle public routes (About, Forbidden, ConfirmPayment, TokenInvalid)
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

  // --- END UPDATED NAVIGATION GUARD LOGIC ---

  next(); // Lanjutkan navigasi
})

router.afterEach(() => {
  // Selesaikan progress bar setelah navigasi selesai (komponen dimuat)
  NProgress.done()
})


export default router
