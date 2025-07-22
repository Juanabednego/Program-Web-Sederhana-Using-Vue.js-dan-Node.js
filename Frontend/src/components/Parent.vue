<script>
    import Child from './Child.vue';

    export default {
        components : {
            Child
        },
        data() {
            return {
                pm : "ID 3"
            }
        }
    }
</script>

<template>
    <div class="flex min-h-screen bg-fuchsia-300 flex-col items-center px-15 py-7">
        <h1 class="font-bold text-3xl">Parent Element</h1>
        <Child :message2="pm"/>
    </div>
</template>


