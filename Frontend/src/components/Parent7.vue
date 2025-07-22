<template>
    <div class="px-10 py-5">
            <h1 class="text-3xl font-bold">Parent</h1>
 
            <input v-model="inputName" type="text" name="" id=""  @change="showChange"
            class="border border-gray-700 w-full px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">

<ul class="">
  <li class="bg-green-400 flex flex-row space-x-3 mt-4 px-8 py-4 rounded-full" v-for="(item, index) in myDataArray7" :key="item.id">
    <Child7 :data="item" :dec="dec"/>
  </li>
</ul>

    </div>
</template>
<script>
import { ref } from 'vue';
import Child7 from './Child7.vue';


    const myDataArray7 = ref([
        {id : 1, name : "Zaka", age : 22},
        {id : 2, name : 'Xaxa', age : 23}
    ])

    const inputName = ref('')

    const dec = id => myDataArray7.value =  myDataArray7.value.filter(item => item.id !== id)

    export default {
        components : {
            Child7
        },
        data(){
            return {
                myDataArray7,
                inputName,
            }   
        },
        methods : {
            dec,
            showChange : function(){
                console.log(inputName.value)
            }
        }
    }
</script>