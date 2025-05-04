<template>
  <div class="card profile-card">
    <div class="profile-header">
      <div class="profile-avatar">
        <span>{{ userInitials }}</span>
      </div>
      <div class="profile-info">
        <h2>{{ (user && user.displayName) || (user && user.email) || 'Profil' }}</h2>
        <p class="profile-email">{{ user && user.email }}</p>
      </div>
    </div>
    <div class="profile-section">
      <h3>Compétences</h3>
      <ul class="profile-list">
        <li v-for="(comp, i) in skills" :key="i">
          <strong>{{ comp.titre }}</strong> — {{ comp.niveau }}
        </li>
      </ul>
    </div>
    <div class="profile-section">
      <h3>Projets</h3>
      <ul class="profile-list">
        <li v-for="(proj, i) in projects" :key="i">
          <strong>{{ proj.title }}</strong> — {{ proj.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {auth, db} from '../firebase'
import {onAuthStateChanged} from 'firebase/auth'
import {ref, onMounted, computed} from 'vue'
import {collection, query, where, getDocs} from 'firebase/firestore'
export default {
    name: 'ProfileView',
    setup() {
        const user = ref(null)
        const skills = ref([])
        const projects = ref([])
        const fetchSkills = async (uid) => {
            skills.value = [];
            const q = query(collection(db, 'Compétence'), where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => skills.value.push(doc.data()));
        }
        const fetchProjects = async (uid) => {
            projects.value = [];
            const q = query(collection(db, 'projects'), where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => projects.value.push(doc.data()));
        }
        const userInitials = computed(() => {
          if (!user.value) return '';
          if (user.value.displayName) {
            return user.value.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
          }
          if (user.value.email) {
            return user.value.email[0].toUpperCase();
          }
          return '';
        });
        onMounted(() => {
            onAuthStateChanged(auth, (u) => {
                user.value = u;
                if (u) {
                    fetchSkills(u.uid);
                    fetchProjects(u.uid);
                }
            })
        })
        return { user, skills, projects, userInitials }
    }
}
</script>

<style scoped>
.profile-card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(44,62,80,0.10);
  background: #fff;
}
.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}
.profile-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b983 60%, #e0e7ef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  color: #fff;
  font-weight: bold;
  margin-right: 1.5rem;
  box-shadow: 0 2px 8px rgba(44,62,80,0.10);
}
.profile-info h2 {
  margin: 0 0 0.2rem 0;
  font-size: 2rem;
  color: #2c3e50;
}
.profile-email {
  color: #888;
  font-size: 1rem;
}
.profile-section {
  margin-bottom: 1.5rem;
  text-align: left;
}
.profile-section h3 {
  color: #42b983;
  margin-bottom: 0.7rem;
}
.profile-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.profile-list li {
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  padding: 0.7rem 1rem;
  box-shadow: 0 1px 4px rgba(44,62,80,0.04);
}
</style>