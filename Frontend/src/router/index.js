

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

const routes = [
  // Halaman Login yang akan dialihkan jika sudah login
  {
    path: '/',
    name: 'Login',
    component: Login,
    beforeEnter: (to, from, next) => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      const role = localStorage.getItem('role')

      // Jika sudah login, arahkan berdasarkan role
      if (isLoggedIn) {
        if (role === 'admin') {
          next('/dashboard') // Admin diarahkan ke dashboard
        } else if (role === 'customer') { 
          next('/home') // Customer diarahkan ke home
        }
      } else {
        next() // Jika belum login, tetap ke halaman login  
      }
    }
  },

  { path: '/register', name: 'Register', component: Register },

  // Halaman untuk admin 
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/update/:id',
    name: 'UpdateUser',
    component: UpdateUser,
    props: true,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: Detail,
    props: true,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/kelola-pipa',
    name: 'KelolaPipa',
    component: IndexKelolaPipa, // route untuk kelola pipa
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/update-pipa/:id',
    name: 'UpdatePipa',
    component: UpdatePipa, // route untuk update pipa
    props: true,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/tambah-pipa',
    name: 'tambah-pipa',
    component: CreatePipa,
    meta: {
      requiresAuth: true,
      role: 'admin'
    },
  },
    {
    path: '/purchases', // Rute baru untuk daftar pembelian
    name: 'ManagePurchases',
    component: ManagePurchasesPage,
    meta: { requiresRole: 'admin' }
  },
  {
    path: '/purchases/:id', // Rute baru untuk detail pembelian
    name: 'PurchaseDetail', 
    component: PurchaseDetailPage,
    props: true,
    meta: { requiresRole: 'admin' }
  },


  // Halaman untuk customer
  {
    path: '/customer-page',
    name: 'CustomerPage',
    component: CustomerPage,
    meta: { requiresRole: 'customer' }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresRole: 'customer' }
  },
 {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { requiresAuth: true, roles: ['customer'] } // Cart butuh customer login (sesuai request Anda)
  },
 {
    path: '/pemesanan',
    name: 'pemesanan',
    component: Pemesanan,
    meta: { requiresAuth: true, roles: ['customer'] } // Cart butuh customer login (sesuai request Anda)
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { requiresAuth: true, roles: ['customer'] } // Checkout butuh customer login
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'orderConfirmation',
    component: OrderConfirmationView,
    props: true,
    meta: { requiresAuth: true, roles: ['customer'] }
  },

  // Halaman umum
  { path: '/about', name: 'About', component: About },

  // Forbidden page
  { path: '/forbidden', name: 'Forbidden', component: Forbidden }
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

  // Logika pengalihan untuk halaman login (rute '/')
  if (to.path === '/') {
    if (isLoggedIn) {
      if (role === 'admin') {
        NProgress.done() // Selesaikan progress bar jika langsung dialihkan
        return next('/dashboard')
      } else if (role === 'customer') {
        NProgress.done() // Selesaikan progress bar jika langsung dialihkan
        return next('/home')
      }
    } else {
      return next() // Lanjutkan ke halaman login jika belum login
    }
  }

  // Jika belum login dan mencoba mengakses halaman yang membutuhkan login
  const protectedRoutes = ['/dashboard', '/update', '/detail', '/customer-page', '/home', '/kelola-pipa', '/update-pipa', '/tambah-pipa']
  if (protectedRoutes.some(path => to.path.startsWith(path)) && (!isLoggedIn || !token)) {
    NProgress.done() // Selesaikan progress bar jika dialihkan ke login
    return next('/') // redirect ke login
  }

  // Role-based access control
  if (to.meta.requiresRole) {
    if (to.meta.requiresRole === 'admin' && role !== 'admin') {
      NProgress.done() // Selesaikan progress bar jika dialihkan ke Forbidden
      return next('/forbidden') // Redirect ke Forbidden page jika bukan admin
    }

    if (to.meta.requiresRole === 'customer' && role !== 'customer') {
      NProgress.done() // Selesaikan progress bar jika dialihkan ke Forbidden
      return next('/forbidden') // Redirect ke Forbidden page jika bukan customer
    }
  }

  next() // Lanjutkan navigasi
})

router.afterEach(() => {
  // Selesaikan progress bar setelah navigasi selesai (komponen dimuat)
  NProgress.done()
})


export default router