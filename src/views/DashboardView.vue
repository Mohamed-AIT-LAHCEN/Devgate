<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Welcome to DevGate</h1>
      <div class="user-info" v-if="user">
        <img :src="user.photoURL" alt="Profile" class="profile-pic" v-if="user.photoURL">
        <span>{{ user.displayName }}</span>
      </div>
    </header>

    <div class="dashboard-grid">
      <!-- Skills Section -->
      <section class="dashboard-section">
        <h2>My Skills</h2>
        <div class="skills-list">
          <!-- Skills will be populated here -->
        </div>
      </section>

      <!-- Projects Section -->
      <section class="dashboard-section">
        <h2>My Projects</h2>
        <div class="projects-grid">
          <!-- Projects will be populated here -->
        </div>
      </section>

      <!-- Activity Timeline -->
      <section class="dashboard-section">
        <h2>Recent Activity</h2>
        <div class="timeline">
          <!-- Timeline items will be populated here -->
        </div>
      </section>

      <!-- Technical Objectives -->
      <section class="dashboard-section">
        <h2>Technical Objectives</h2>
        <div class="objectives-list">
          <!-- Objectives will be populated here -->
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default {
  name: 'DashboardView',
  setup() {
    const user = ref(null)

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
      })
    })

    return {
      user
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-pic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.dashboard-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}
</style> 