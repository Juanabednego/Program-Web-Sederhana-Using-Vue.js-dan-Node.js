<template>
    <h1>List</h1>
    <ul>
        {{ myDataArray6.map(item => <Child6/>) }}
    </ul>
</template>

<script>
import { ref } from 'vue';
import Child6 from './Child6.vue';
import Child6 from './Child6.vue';

const myDataArray6 = ref([
    {id : 1, name : "Andi", age : 12},
    {id : 2, name : "Budi", age : 22}
])

    export default {
        components : {
            Child6
        },
        data(){
            return {
                myDataArray6
            }
        }
    }
</script>