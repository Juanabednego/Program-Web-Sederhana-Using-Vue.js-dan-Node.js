<script>

import axios from 'axios';
import { ref } from 'vue';
import BE_PRE_URL from '../../url';
import { useRouter } from 'vue-router';

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')


const router = useRouter()



const hanldleLogin = async () => {

    loading.value = true
    errorMessage.value = ''

    try{
        const response = await axios.post(`${BE_PRE_URL}/auth`, 
            {
                username,
                password
            }
        )
        
        const {data, jwt} = response.data

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('jwt', jwt)
        localStorage.setItem('userData', data)
        
        router.push('/home')
    }catch(e){
        if(error.response && error.response.data.message){
            errorMessage.value = error.response.data.message
        }else{
            errorMessage.value = 'Terjadi kesalahan saat login'
        }
    }finally{
        loading.value = false
    }
}  

const goToRegister = () => {
    router.push('/register')
}

</script>


<template>
    <form @submit.prevent="hanldleLogin">
        <input type="text" v-model="username" name="" id="">

        <input type="password" v-model="password" name="" id="">

        <button type="submit"
            :disable="loading"
        >
            <span v-if="loading">Loading...</span>
            <span v-else>Login</span>
        </button>
        
    </form>
          <button
            type="button"
            class="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg ml-2 transition"
            @click="goToRegister"
          >
            Registrasi
          </button>

</template>