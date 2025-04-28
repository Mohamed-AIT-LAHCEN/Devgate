<template>
<div>
    <form @submit.prevent = "login">
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" v-model="email" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" v-model="password" required>
        </div>
        <button type="submit" class="btn btn-success">Login</button>
    </form>
    <div v-if="Error">
        {{ Error }}
    </div>
</div>
</template>

<script>
import {auth} from '../firebase'
import {signInWithEmailAndPassword} from 'firebase/auth'
import {ref} from 'vue'
import router from '@/router'
export default {
    name:'lo-gin',
    setup() {
        const email = ref("")
        const password = ref("")
        const Error = ref(null)
        const login = async () => {
            await signInWithEmailAndPassword(auth, email.value, password.value)
            .then((userData) => {
                const user = userData.user
                console.log(user)
            })
            .then(() => {
                router.push('/')
            })
            .catch((error) => {
                Error.value = error.message
            })
        }
        return {
            email,
            password,
            Error,
            login
        }
    }
}
</script>