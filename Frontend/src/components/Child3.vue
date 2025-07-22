<template>
    <h2 class="font bold text-2xl">Child3 : pesan dari parent {{ myMessage3 }}</h2>
</template>

<script>
    export default{
        props : {
            myMessage3 : {
                type : String
            }
        }
    }
</script>