<template>
  <div class="signup-container">
    <div class="card signup-card">
      <h2 class="page-title">Inscription</h2>
      <form @submit.prevent="signUp" class="signup-form">
        <div class="form-group">
          <label for="name">Nom complet</label>
          <input type="text" v-model="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" v-model="password" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-submit">S'inscrire</button>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
import router from '@/router'
import {auth} from '../firebase'
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from 'firebase/auth'
import {ref} from 'vue'
export default {
  name: 'SignUpPage',
  setup() {
    const name = ref("")
    const email = ref("")
    const password = ref("")
    const error = ref("")
    const signUp = async () => {
      error.value = ""
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
        const user = userCredential.user
        await updateProfile(user, {displayName: name.value})
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: name.value
        }))
        await signInWithEmailAndPassword(auth, email.value, password.value)
        await router.push('/')
        window.location.reload()
      } catch (err) {
        error.value = err.message
      }
    }
    return {
      name,
      email,
      password,
      error,
      signUp
    }
  }
}
</script>

<style scoped>
.signup-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.signup-card {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  background: #333;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
}
.page-title {
  color: #e0e7ef;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}
.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group label {
  color: #e0e7ef;
  margin-bottom: 0.5rem;
  display: block;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 6px;
  background: #222;
  color: #e0e7ef;
  font-size: 1rem;
}
.form-group input:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
}
.form-actions {
  display: flex;
  justify-content: center;
}
.btn-submit {
  background: #4CAF50;
  color: white;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover {
  background: #388E3C;
}
.error-message {
  color: #ff6b6b;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-top: 1rem;
  text-align: center;
  font-size: 1rem;
}
</style>