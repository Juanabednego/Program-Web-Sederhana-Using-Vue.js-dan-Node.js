<template>
    <h2 class="text-2xl">child : {{ myMessage }}</h2>

</template>

<script>
    export default{
        props : {
            myMessage : {
                type : String
            }
        }
    }
</script>