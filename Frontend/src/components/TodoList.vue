<template>
 <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-md space-y-8">
            <div>
                <h2 class="text-center text-3xl font-bold text-gray-900">To-Do List</h2>
                <p class="mt-2 text-center text-sm text-gray-600">Tulis tugas yang perlu kamu selesaikan</p>
            </div>

            <!-- Form Input -->
            <div class="mt-8 space-y-6">
                <div class="flex">
                    <input id="taskInput" type="text" class="w-full px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tambah tugas baru" />
                    <button onclick="addTask()" class="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Tambah
                    </button>
                </div>
            </div>

            <!-- Daftar Tugas -->
            <ul id="taskList" class="mt-4 space-y-3">
                <!-- Daftar tugas akan muncul di sini -->
                 <li class="flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-gray-200">
                    <!-- Checkbox untuk menandai tugas selesai -->
                    <input type="checkbox" class="mr-3 text-blue-500 focus:ring-blue-500" />

                    <!-- Teks tugas -->
                    <span class="text-gray-800 flex-1 line-through">Nama Tugas</span>

                    <!-- Tombol Hapus -->
                    <button class="text-red-500 hover:text-red-700 focus:outline-none" onclick="this.closest('li').remove()">Hapus</button>
                </li>

            </ul>
        </div>
    </div>
</template>