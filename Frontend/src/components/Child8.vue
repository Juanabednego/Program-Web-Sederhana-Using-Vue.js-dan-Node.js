<template>
 <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">📝 My To-Do List</h1>

    <!-- Input Section -->
    <div class="flex mb-4">
      <input type="text" placeholder="Add a new task..." class="flex-1 px-4 py-2 border rounded-l-full focus:outline-none focus:ring-2 focus:ring-purple-400">
      <button class="bg-purple-600 text-white px-6 py-2 rounded-r-full hover:bg-purple-700 transition">Add</button>
    </div>

    <!-- Task List -->
    <ul class="space-y-3">
      <li class="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-full shadow-sm">
        <span class="text-gray-700">✅ Learn Tailwind</span>
        <button class="text-red-500 hover:text-red-700">✕</button>
      </li>
      <li class="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-full shadow-sm">
        <span class="text-gray-700">📘 Read a book</span>
        <button class="text-red-500 hover:text-red-700">✕</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
</script>

