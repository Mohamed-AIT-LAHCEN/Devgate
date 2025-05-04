<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-logo">
        <img src="@/assets/image.png" alt="DevGate Logo" class="logo" />
        <span class="brand">DevGate</span>
      </div>
      <div class="nav-links">
        <RouterLink to="/">Accueil</RouterLink>
        <template v-if="!isLoggedIn">
          <RouterLink to="/signUp">Inscription</RouterLink>
          <RouterLink to="/Login">Connexion</RouterLink>
        </template>
        <template v-else>
          <div class="profile-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
            <div class="profile-avatar-nav" @click="goToProfile" style="cursor:pointer;">
              <span>{{ userInitials }}</span>
            </div>
            <span class="profile-name-nav" @click="goToProfile" style="cursor:pointer;">{{ userName }}</span>
          </div>
          <button v-if="isLoggedIn" @click="logout" class="btn btn-secondary logout-navbar">Déconnexion</button>
          <RouterLink to="/AddProject">Projets</RouterLink>
          <RouterLink to="/GestComp">Compétences</RouterLink>
          <RouterLink to="/timeline">Timeline</RouterLink>
          <RouterLink to="/objectives">Objectifs</RouterLink>
        </template>
      </div>
    </nav>
    <main class="main-content">
      <router-view/>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
export default {
  setup() {
    const isLoggedIn = ref(false)
    const showDropdown = ref(false)
    const user = ref(null)
    const router = useRouter()
    onMounted(() => {
      const userData = localStorage.getItem('user')
      isLoggedIn.value = !!userData
      if (userData) user.value = JSON.parse(userData)
    })
    const logout = () => {
      localStorage.removeItem('user')
      window.location.reload()
    }
    const userInitials = computed(() => {
      if (!user.value) return ''
      if (user.value.displayName) {
        return user.value.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
      }
      if (user.value.email) {
        return user.value.email[0].toUpperCase()
      }
      return ''
    })
    const userName = computed(() => {
      if (!user.value) return ''
      return user.value.displayName || user.value.email
    })
    const goToProfile = () => {
      router.push('/dashboard')
    }
    return { isLoggedIn, logout, userInitials, userName, showDropdown, goToProfile }
  }
}
</script>

<style>
body {
  background: linear-gradient(120deg, #1a1a1a 0%, #2d2d2d 100%);
  margin: 0;
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #e0e7ef;
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(26, 26, 26, 0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  padding: 0.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #333;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}
.brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e0e7ef;
  letter-spacing: 1px;
}
.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.nav-links a {
  text-decoration: none;
  color: #e0e7ef;
  font-weight: 500;
  transition: color 0.2s, background 0.2s, border-radius 0.2s;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
}
.nav-links a.router-link-exact-active {
  color: #fff;
  background: #333;
}
.nav-links a:hover {
  color: #fff;
  background: #444;
}
.profile-dropdown {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 1rem;
}
.profile-avatar-nav {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #333 60%, #444 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #fff;
  font-weight: bold;
  margin-right: 0.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.profile-name-nav {
  font-weight: 500;
  color: #e0e7ef;
  margin-right: 0.3rem;
}
.dropdown-menu {
  position: absolute;
  top: 120%;
  left: 0;
  background: #333;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  padding: 0.7rem 1.2rem;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-menu a, .dropdown-menu button {
  background: none;
  border: none;
  color: #e0e7ef;
  text-align: left;
  font-size: 1rem;
  padding: 0.2rem 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.dropdown-menu a:hover, .dropdown-menu button:hover {
  background: #444;
}
.btn-secondary {
  background: #333;
  color: #e0e7ef;
}
.btn-secondary:hover {
  background: #444;
}
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
}

/* Global Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e0e7ef;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #444;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #333;
  color: #e0e7ef;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 3px rgba(102, 102, 102, 0.2);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #888;
}

form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background: #333;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
}

form button[type="submit"] {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 1rem;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #2d2d2d;
  border-radius: 4px;
  border: 1px solid #444;
}

/* Card styles */
.card {
  background: #333;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
  padding: 2rem;
  margin: 1rem;
  min-width: 320px;
  max-width: 600px;
  width: 100%;
}

button, .btn {
  background: #444;
  color: #e0e7ef;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0.2rem 0.2rem;
}
button:hover, .btn:hover {
  background: #555;
}
input, select, textarea {
  border: 1px solid #444;
  border-radius: 6px;
  padding: 0.5rem;
  margin: 0.3rem 0;
  width: 100%;
  font-size: 1rem;
  box-sizing: border-box;
  background: #333;
  color: #e0e7ef;
}
label {
  font-weight: 500;
  color: #e0e7ef;
}
.logout-navbar {
  margin-left: 1rem;
  background: #f44336;
  color: #fff;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-navbar:hover {
  background: #d32f2f;
}
</style>
