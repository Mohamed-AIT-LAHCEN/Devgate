<template>
  <div class="app">
    <nav class="main-nav" v-if="isAuthenticated">
      <div class="nav-brand">
        <router-link to="/dashboard" class="brand-link">
          <span class="brand-text">DevGate</span>
        </router-link>
      </div>
      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/profile" class="nav-link">Profile</router-link>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <main :class="['main-content', { 'with-nav': isAuthenticated }]">
      <router-view></router-view>
    </main>

    <footer class="app-footer" v-if="isAuthenticated">
      <p>&copy; 2024 DevGate. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const isAuthenticated = ref(false)

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        isAuthenticated.value = !!user
        if (user) {
          router.push('/dashboard')
        }
      })
    })

    const handleLogout = async () => {
      try {
        await signOut(auth)
        router.push('/login')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }

    return {
      isAuthenticated,
      handleLogout
    }
  }
}
</script>

<style>
:root {
  --primary-color: #4CAF50;
  --secondary-color: #2196F3;
  --danger-color: #f44336;
  --text-color: #2c3e50;
  --bg-color: #f5f5f5;
  --white: #ffffff;
  --border-color: #ddd;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: var(--bg-color);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-nav {
  background-color: var(--white);
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.brand-link {
  text-decoration: none;
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--primary-color);
}

.logout-btn {
  background-color: var(--danger-color);
  color: var(--white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #d32f2f;
}

.main-content {
  flex: 1;
  padding: 2rem;
  margin-top: 0;
}

.main-content.with-nav {
  margin-top: 4rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.app-footer {
  background-color: var(--white);
  padding: 1rem 2rem;
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Button Styles */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--white);
}

.btn-primary:hover {
  background-color: #388e3c;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--white);
}

.btn-secondary:hover {
  background-color: #1976d2;
}

/* Card Styles */
.card {
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-nav {
    padding: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .main-content.with-nav {
    margin-top: 3.5rem;
  }
}
</style>
