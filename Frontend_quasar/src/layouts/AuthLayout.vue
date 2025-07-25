<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>