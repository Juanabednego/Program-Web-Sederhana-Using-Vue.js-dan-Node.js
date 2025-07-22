<template>
    <div class="flex  min-h-screen items-center justify-center">
        <div class="bg-orange-200 rounded-2xl flex flex-col items-center justify-center py-7 px-10">
            <h1 class="font-bold text-3xl">Counters</h1>
            <h2 class="text-2xl">Current Count : {{ counter }}</h2>
            <div class="flex mt-5 space-x-5 px-2 py-2 text-white">
                <button @click="add" class="px-4 py-2 bg-blue-500 rounded-full">add</button>
                <button @click="dec" class="px-4 py-2 bg-red-500 rounded-full">decrement</button>
                <button @click="reset" class="px-4 py-2 bg-slate-500 rounded-full">reset</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const counter = ref(0)

const add = () => counter.value += 1
const dec = () => counter.value -= 1
const reset = () => counter.value = 0
</script>