<template>
    <h1 class="font-bold text-2xl">{{ data.name }} || {{ data.age }}</h1>
    <button @click="dec(data.id)" class="bg-red-400 px-4 py-2 rounded-full text-white">X</button>
</template>


<script>

export default {
    props : {
        data : {
            type : Function
        },
        dec : {
            type : Function
        }
    }
}

</script>