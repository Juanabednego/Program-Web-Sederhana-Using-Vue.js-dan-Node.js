<template>
    <li class="bg-blue-200 px-10 py-5 space-x-5 flex" v-for="(item, index) in dataArray5" :key="item.id">
        <h1 class="px-4 py-2">{{ item.name }}</h1>  
        <h1 class="px-4 py-2">{{ item.age }}</h1> 
        <button @click="callDec(item.id)" class="bg-red-300 rounded-full px-4 py-2">Hapus</button>
    </li>
</template>

<script>
    export default {
        props : {
            dataArray5 : {
                type : Array
            },
            dec : {
                type : Function
            }
        },
        methods : {
            callDec(id){
                this.dec(id)
            }
        }
    }
</script>