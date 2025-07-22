<template>
    <div class="flex items-center justify-center flex-col min-h-screen">
        <div class="bg-orange-200 px-10 py-5 rounded-2xl text-center">
         <h1 class="font-bold text-3xl">Counters</h1>
         <h2 class="text-xl">Current Count : {{ counter }}</h2>

         <div class="flex mt-5 space-x-4">
            <button @click="add" class="px-4 py-2 bg-blue-600 text-white rounded-full">add</button>
            <button @click="dec" class="px-4 py-2 text-white bg-red-600 rounded-full">decrement</button>
            <button @click="reset" class="px-4 py-2 bg-slate-500 text-white rounded-full">reset</button>
        </div>
        </div>
    </div>
</template>

<script setup>
    import {ref} from 'vue'

    const counter = ref(0)

    const add = () => counter.value += 1
    const dec = () => counter.value -= 1
    const reset = () => counter.value = 0
</script>