<template>
  <div class="home">
    <RouterLink to="/signUp">Sign Up</RouterLink> |
    <RouterLink to="/Login">Login</RouterLink>|
   <RouterLink to="/AddProject">Add Project</RouterLink>|
   <RouterLink to="/GestComp">Gestion des compétences</RouterLink>|
   <div v-if="user">Hello {{user.displayName}} </div>
  </div>
  <router-view/>
</template>

<script>
import {auth} from '../firebase'
import { onAuthStateChanged } from 'firebase/auth';
import {ref, onMounted} from 'vue'
export default {
  name: 'HomeView',
  setup() {
    const user = ref(null)
    onMounted(() => {
      onAuthStateChanged(auth, (u) => {
        if (u) {
          user.value = u;
        }   
      })
    }
    )
    return {
      user
    }
  }
  
}
</script>
