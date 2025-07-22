<template>
    <h1 class="font-bold text-3xl">Parent5</h1>
    <ul class="space-y-3">
        <Child5 :dataArray5="dataArray5" :dec="dec" />
    </ul>
</template>

<script>
import { ref } from 'vue';
import Child5 from './Child5.vue';

const dataArray5 = ref([
    {id : 1, name : "Candra", age : 20},
    {id : 2, name : "Dani", age : 33}
])

const dec = (id) =>  dataArray5.value = dataArray5.value.filter(item => item.id !== id)

export default {
    components : {
        Child5
    },
    data () {
        return {
            dataArray5
        }
    },
    methods : {
        dec
    }
}

</script>