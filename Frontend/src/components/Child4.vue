<template>
    <h2 class="text-2xl">Child Element | message received : {{ message4 }}</h2>

</template>

<script>

export default {
    props : {
        message4 : {
            type : String
        }
    }
}

</script>