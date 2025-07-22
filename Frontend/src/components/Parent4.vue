<template>
    <h1 class="font-bold text-3xl">Parent4 Element</h1>
    <Child4 :message4="myMessage4"/>
</template>

<script>
import Child4 from './Child4.vue';

    export default {
        components : {
            Child4
        },
        data(){
            return {
                myMessage4 : "Helo from parent 4"
            }
        }
    }
</script>