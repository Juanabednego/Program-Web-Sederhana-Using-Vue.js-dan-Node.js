<template>
  <q-layout view="lHh Lpr lFf">
    <Navbar /> <!-- Komponen Navbar Anda di sini -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup>
import Navbar from 'src/components/Navbar.vue';
</script>