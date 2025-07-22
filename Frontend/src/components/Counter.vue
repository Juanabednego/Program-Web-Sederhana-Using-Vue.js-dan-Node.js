<template>
  <div class="flex items-center justify-center min-h-screen flex-col">
    <!-- Judul utama -->
    <h1 class="text-3xl font-bold">Counters</h1>
    
    <!-- Menampilkan counter -->
    <h2 class="text-xl mt-4">Current Count: {{ counter }}</h2>  
    
    <!-- Tombol-tombol untuk mengubah counter -->
    <div class="mt-4 flex space-x-4">
      <button @click="add" class="px-4 py-2 bg-blue-500 text-white rounded">Add</button>
      <button @click="dec" class="px-4 py-2 bg-red-500 text-white rounded">Decrement</button>
      <button @click="reset" class="px-4 py-2 bg-gray-500 text-white rounded">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const counter = ref(0)

const add = () => counter.value += 1
const dec = () => counter.value -= 1
const reset = () => counter.value = 0
</script>
