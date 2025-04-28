<template>


</template>

<script>
import {auth, db} from '../firebase'
import {onAuthStateChanged} from 'firebase/auth'
import {ref, onMounted} from 'vue'
export default {
    setup() {
        const user = ref(null)
        onMounted(
            onAuthStateChanged(auth, (u) => {
            user.value = u
        })

        )
    }
}
</script>