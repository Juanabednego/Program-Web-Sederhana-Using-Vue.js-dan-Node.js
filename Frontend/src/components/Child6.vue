<template>
    <li v-for="(item, index) in dataArray6" :key="item.id">
        <h2>{{ item.name }}</h2> <h2>{{ item.age }}</h2>
    </li>
</template>

<script>
    export default {
        props : {
            dataArray6 : {
                type : Array
            }
        }
    }
</script>