<template>
  <div>
    <h2>Halaman Detail</h2>
    <p><strong>ID dari URL:</strong> {{ id }}</p>
    
    <div>
      <p><strong>Nama (query):</strong> {{ route.query.nama }}</p>
      <p><strong>Tags (array):</strong> {{ route.query.tags }}</p>
      <p><strong>Info (object):</strong></p>
      <pre>{{ parsedInfo }}</pre>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const id = computed(() => route.params.id)

const parsedInfo = computed(() => {
  try {
    return JSON.parse(route.query.info || '{}')
  } catch (e) {
    return {}
  }
})
</script>
