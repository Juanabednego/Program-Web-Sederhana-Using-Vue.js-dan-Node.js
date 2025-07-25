<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Forbidden</h2>
      <p class="text-center text-gray-600 mb-4">You do not have permission to access this page.</p>
      
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

    const logout = localStorage.getItem('logout')
    if(logout){
    window.location.replace('/'); 
    }

const goBack = () => {

  localStorage.removeItem('isLoggedIn'); 
  localStorage.removeItem('role');
  localStorage.removeItem('jwt'); 

  // Redirect ke halaman login dan reload
  window.location.replace('/'); 
}
</script>

<style scoped>
/* Optional styling */
</style>
