<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>Create Account</h1>
      <p class="auth-subtitle">Join DevGate to track your progress</p>

      <form @submit.prevent="handleSignUp" class="auth-form">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required
            placeholder="Enter your full name"
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="Enter your email"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="Create a password"
          >
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </div>

        <div class="auth-links">
          <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="social-auth">
        <p>Or sign up with</p>
        <button @click="handleGoogleSignUp" class="btn btn-google">
          <img src="../assets/google-icon.svg" alt="Google" class="social-icon">
          Google
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'

export default {
  name: 'SignUp',
  setup() {
    const router = useRouter()
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleSignUp = async () => {
      loading.value = true
      error.value = ''

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
        await updateProfile(userCredential.user, {
          displayName: name.value
        })
        router.push('/dashboard')
      } catch (err) {
        error.value = err.message
        console.error('Signup error:', err)
      } finally {
        loading.value = false
      }
    }

    const handleGoogleSignUp = async () => {
      loading.value = true
      error.value = ''

      try {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        router.push('/dashboard')
      } catch (err) {
        error.value = 'Failed to sign up with Google'
        console.error('Google signup error:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      name,
      email,
      password,
      error,
      loading,
      handleSignUp,
      handleGoogleSignUp
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

.auth-card {
  background: var(--white);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h1 {
  text-align: center;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.auth-form {
  margin-bottom: 2rem;
}

.form-actions {
  margin-top: 1.5rem;
}

.auth-links {
  text-align: center;
  margin-top: 1rem;
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}

.error-message {
  color: var(--danger-color);
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.social-auth {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.social-auth p {
  color: #666;
  margin-bottom: 1rem;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--white);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  width: 100%;
}

.btn-google:hover {
  background-color: #f5f5f5;
}

.social-icon {
  width: 20px;
  height: 20px;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>