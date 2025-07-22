<template>
    <h1 class="text-3xl font-bold">Parent 2</h1>
    <Child2 :myMessage="pm2"/>
</template>

<script>
import Child2 from './Child2.vue';

    export default {
        components : {
            Child2
        },
        data(){
            return {
                pm2 : "from parent 2"
            }
        }
    }
</script>

