<!-- src/pages/Cart.vue -->
<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="q-mx-auto q-px-md q-py-lg" style="max-width: 1000px;">
      <div class="text-h4 text-weight-bold text-grey-9 q-mb-lg text-center">Keranjang Belanja Anda</div>

      <!-- Empty Cart State -->
      <div v-if="cartStore.items.length === 0" class="text-center q-py-xl">
        <q-icon name="shopping_cart" size="xl" color="grey-4" class="q-mb-md" />
        <div class="text-h6 text-grey-7 q-mb-sm">Keranjang Anda kosong.</div>
        <q-btn
          label="Mulai belanja sekarang!"
          color="primary"
          to="/home"
          unelevated
          class="q-mt-md"
        />
      </div>

      <!-- Cart Items List -->
      <div v-else>
        <q-list bordered class="rounded-borders shadow-2 q-mb-lg">
          <q-item v-for="item in cartStore.items" :key="item.product._id" class="q-py-md">
            <q-item-section avatar>
              <q-img
                :src="item.product.imageUrl ? item.product.imageUrl : 'https://placehold.co/96x96/E0E0E0/616161?text=No+Image'"
                :alt="item.product.name"
                class="rounded-borders"
                style="width: 96px; height: 96px; object-fit: cover;"
                no-native-menu
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-negative text-white">
                    Gagal memuat gambar
                  </div>
                </template>
              </q-img>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-h6 text-weight-semibold">{{ item.product.name }}</q-item-label>
              <q-item-label caption class="text-body2 text-grey-7">
                Rp {{ formatCurrency(item.product.price) }} /meter
              </q-item-label>
              <q-item-label caption class="text-body2 text-grey-6">
                Diameter: {{ item.product.diameter }}, Panjang: {{ item.product.length }}, Material: {{ item.product.material }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="flex items-center q-gutter-x-sm q-mb-sm">
                <q-btn
                  round
                  flat
                  icon="remove"
                  color="grey-7"
                  @click="cartStore.updateCartItemQuantity(item.product._id, item.quantity - 1)"
                  :disable="item.quantity <= 1"
                  size="sm"
                />
                <span class="text-body1 text-weight-bold">{{ item.quantity }}</span>
                <q-btn
                  round
                  flat
                  icon="add"
                  color="grey-7"
                  @click="cartStore.updateCartItemQuantity(item.product._id, item.quantity + 1)"
                  :disable="item.quantity >= item.product.stock"
                  size="sm"
                />
              </div>
              <div class="text-body1 text-weight-bold text-right q-mt-sm">
                Rp {{ formatCurrency(item.product.price * item.quantity) }}
              </div>
            </q-item-section>

            <q-item-section side>
              <q-btn
                round
                flat
                icon="delete"
                color="negative"
                @click="confirmRemoveItem(item.product._id, item.product.name)"
                size="md"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Cart Summary -->
        <q-card class="shadow-2 rounded-borders q-pa-md bg-blue-1">
          <div class="row justify-between items-center">
            <div class="text-h6 text-weight-semibold text-blue-grey-10">Subtotal Barang:</div>
            <div class="text-h5 text-weight-bold text-blue-grey-10">Rp {{ formatCurrency(cartStore.cartSubtotal) }}</div>
          </div>
        </q-card>

        <!-- Action Buttons -->
        <div class="flex justify-end q-mt-lg q-gutter-md">
          <q-btn
            label="Lanjutkan Belanja"
            color="grey-6"
            text-color="dark"
            to="/home"
            unelevated
            class="q-px-lg q-py-md"
          />
          <q-btn
            label="Lanjutkan ke Pembayaran"
            color="positive"
            @click="proceedToCheckout"
            unelevated
            class="q-px-lg q-py-md"
            :disable="cartStore.items.length === 0 || hasInvalidQuantity"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue';
import { useCartStore } from 'src/stores/cart'; // Pastikan path ini benar
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar'; // Import useQuasar untuk notifikasi dan dialog

const cartStore = useCartStore();
const router = useRouter();
const $q = useQuasar(); // Inisialisasi Quasar instance

// Computed property untuk mengecek apakah ada item dengan kuantitas tidak valid (<= 0)
const hasInvalidQuantity = computed(() => {
  return cartStore.items.some(item => item.quantity <= 0);
});

const proceedToCheckout = () => {
  if (cartStore.items.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Keranjang Anda kosong. Tambahkan produk sebelum checkout!',
      position: 'top',
      timeout: 2000
    });
    return;
  }

  if (hasInvalidQuantity.value) {
    $q.notify({
      type: 'warning',
      message: 'Beberapa item di keranjang memiliki kuantitas 0 atau kurang. Harap perbarui atau hapus.',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  router.push({ name: 'checkout' });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Fungsi untuk konfirmasi penghapusan item
const confirmRemoveItem = (productId, productName) => {
  $q.dialog({
    title: 'Hapus Item',
    message: `Apakah Anda yakin ingin menghapus "${productName}" dari keranjang?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    cartStore.removeFromCart(productId);
    $q.notify({
      type: 'info',
      message: `"${productName}" berhasil dihapus dari keranjang.`,
      position: 'top',
      timeout: 1500
    });
  });
};
</script>

<style scoped>
/* Anda dapat menambahkan gaya kustom di sini jika diperlukan.
   Sebagian besar styling sudah ditangani oleh komponen Quasar dan kelas utilitasnya. */
</style>
