<!-- src/components/Navbar.vue -->
<template>
  <q-header elevated class="bg-grey-9 text-white">
    <q-toolbar>
      <!-- Logo/Title -->
      <q-toolbar-title>
        <router-link :to="role === 'admin' ? { name: 'Dashboard' } : { name: 'Home' }" class="text-white q-link text-h6 text-weight-bold">
          {{ role === 'admin' ? 'Admin Dashboard' : 'PipeStore' }}
        </router-link>
      </q-toolbar-title>

      <!-- Desktop Navigation (hidden on small screens) -->
      <div class="gt-sm flex items-center">
        <template v-if="role === 'admin'">
          <q-btn flat :to="{ name: 'Dashboard' }" label="Dashboard" class="q-mr-sm" />
          <q-btn flat :to="{ name: 'KelolaPipa' }" label="Kelola Pipa" class="q-mr-sm" />
          <q-btn flat :to="{ name: 'ManagePurchases' }" label="Kelola Pembelian" class="q-mr-md" />
        </template>

        <template v-if="role === 'customer'">
          <q-btn flat :to="{ name: 'Home' }" label="Produk Pipa" class="q-mr-sm" />
          <q-btn flat :to="{ name: 'pemesanan' }" label="Pemesanan" class="q-mr-sm" />
          <q-btn flat :to="{ name: 'cart' }" class="q-mr-md">
            <q-icon name="shopping_cart" class="q-mr-xs" />
            Keranjang
            <q-badge v-if="cartStore.cartTotalItems > 0" color="red" floating>{{ cartStore.cartTotalItems }}</q-badge>
          </q-btn>
        </template>

        <!-- Logout Button for Desktop -->
        <q-btn @click="logout" label="Logout" color="red-7" unelevated />
      </div>

      <!-- Mobile Menu Button (hidden on large screens) -->
      <div class="lt-md">
        <q-btn flat round dense icon="menu" @click="toggleMenu" class="text-white">
          <q-menu v-model="isMenuOpen" anchor="bottom right" self="top right" content-class="shadow-2 rounded-borders">
            <q-list style="min-width: 200px">
              <q-item-label header class="text-weight-bold text-uppercase text-caption text-grey-7">Navigasi</q-item-label>

              <template v-if="role === 'admin'">
                <q-item clickable v-close-popup :to="{ name: 'Dashboard' }">
                  <q-item-section>Dashboard</q-item-section>
                </q-item>
                <q-item clickable v-close-popup :to="{ name: 'KelolaPipa' }">
                  <q-item-section>Kelola Pipa</q-item-section>
                </q-item>
                <q-item clickable v-close-popup :to="{ name: 'ManagePurchases' }">
                  <q-item-section>Kelola Pembelian</q-item-section>
                </q-item>
              </template>

              <template v-if="role === 'customer'">
                <q-item clickable v-close-popup :to="{ name: 'Home' }">
                  <q-item-section>Produk Pipa</q-item-section>
                </q-item>
                <q-item clickable v-close-popup :to="{ name: 'cart' }">
                  <q-item-section>Keranjang</q-item-section>
                  <q-item-section side v-if="cartStore.cartTotalItems > 0">
                    <q-badge color="red">{{ cartStore.cartTotalItems }}</q-badge>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup :to="{ name: 'pemesanan' }">
                  <q-item-section>Pemesanan</q-item-section>
                </q-item>
              </template>

              <q-separator />

              <!-- Added 'About' link for completeness based on your older code -->
              <q-item clickable v-close-popup :to="{ name: 'About' }">
                <q-item-section>About</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="logout">
                <q-item-section>Logout</q-item-section>
                <q-item-section side>
                  <q-icon name="logout" color="red-7" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from 'src/stores/cart'; // Pastikan path ini benar
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi

const router = useRouter();
const cartStore = useCartStore();
const $q = useQuasar(); // Inisialisasi Quasar instance

// Mengambil role dari localStorage. Asumsi role sudah disimpan saat login.
const role = computed(() => {
  const storedRole = localStorage.getItem('role');
  console.log('Navbar: Current role from localStorage (computed):', storedRole); // Log untuk debugging
  return storedRole;
});

const isMenuOpen = ref(false);

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
  console.log('Navbar: Mobile menu toggled. isMenuOpen:', isMenuOpen.value); // Log untuk debugging
}

function logout() {
  // Tampilkan dialog konfirmasi
  $q.dialog({
    title: 'Konfirmasi Logout',
    message: 'Apakah Anda yakin ingin keluar?',
    cancel: true,
    persistent: true,
    color: 'primary'
  }).onOk(() => {
    try {
      // Lakukan proses logout
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('jwt');
      localStorage.removeItem('role');
      localStorage.removeItem('userData'); // Hapus juga userData jika ada
      localStorage.setItem('logout', 'true'); // Menandai logout untuk reload

      // Notifikasi sukses logout
      $q.notify({
        type: 'positive',
        message: 'Anda telah berhasil logout.',
        position: 'top',
        timeout: 1500
      });

      // Arahkan ke halaman login dan reload untuk membersihkan state Vuex/Pinia
      router.push('/').then(() => {
        window.location.reload();
      }).catch(err => {
        console.error('Navbar: Error navigating after logout:', err);
        $q.notify({
          type: 'negative',
          message: 'Gagal mengarahkan setelah logout.',
          position: 'top',
          timeout: 2000
        });
      });
    } catch (e) {
      console.error('Navbar: Error during logout process:', e);
      $q.notify({
        type: 'negative',
        message: 'Terjadi kesalahan saat logout.',
        position: 'top',
        timeout: 2000
      });
    }
  }).onCancel(() => {
    // Notifikasi jika logout dibatalkan
    $q.notify({
      type: 'info',
      message: 'Logout dibatalkan.',
      position: 'top',
      timeout: 1000
    });
  });
}

onMounted(() => {
  // Memuat keranjang dari localStorage saat komponen dipasang
  // Ini penting agar jumlah item di keranjang tetap terlihat di navbar
  cartStore.loadCartFromLocalStorage();
  console.log('Navbar: Component mounted. Initial role check:', localStorage.getItem('role'));
});
</script>

<style scoped>
/*
  Sebagian besar styling Tailwind CSS yang terkait dengan layout dan warna
  telah diganti dengan komponen dan kelas utilitas Quasar (misalnya, bg-grey-9, q-mr-sm, flex, dll.).
  Tidak perlu lagi styling khusus untuk router-link-active karena Quasar
  menangani state aktif pada q-btn dan q-item secara otomatis.
*/

/* Custom link styling if needed, otherwise Quasar's default is good */
.q-link {
  text-decoration: none;
}

.q-link:hover {
  opacity: 0.8; /* Slight hover effect */
}
</style>
