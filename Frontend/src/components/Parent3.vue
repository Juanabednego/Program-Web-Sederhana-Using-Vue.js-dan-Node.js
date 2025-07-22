<template>
    <h1 class="font-bold text-3xl">Parent3</h1>
    <Child3 :myMessage3="myMessage3"/>
</template>

<script>
import Child3 from './Child3.vue';

export default {
    components : {
        Child3
    },
    data() {
        return {
            myMessage3 : "message 3"
        }
    }
}
</script>  