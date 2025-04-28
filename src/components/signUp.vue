<template>
<div>
    <form @submit.prevent="signUp">
        <div class="form-group">
            <label for="name">Full name</label>
            <input type="text" v-model="name" required>
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" v-model="email" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" v-model="password" required>
        </div>
        <button type="submit" class="btn btn-success">Submit</button>
    </form>
    <div v-if="Error">
        {{ Error }}
    </div>
</div>
</template>

<script>
import router from '@/router'
import {auth} from '../firebase'
import {createUserWithEmailAndPassword} from 'firebase/auth'
import {ref} from 'vue'
import {updateProfile} from 'firebase/auth'
export default {
    setup() {
        const name = ref("")
        const email = ref("")
        const password = ref("")
        const Error = ref(null)
        const signUp = async () => {
            await createUserWithEmailAndPassword(auth ,email.value, password.value)
            .then( async (userData) => {
                const user = userData.user
                return updateProfile(user, {displayName: name.value})
            })
            .then(() => {
                router.push('/')
            }
            )
            .catch((error) => {
                Error.value = error.message
            });
            
        }
        return {
            name,
            email,
            Error,
            password,
            signUp
        }
    }
}
</script>