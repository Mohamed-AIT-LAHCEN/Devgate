<template>
  <div class="home-container">
    <div class="card home-card">
      <div class="home-header">
        <h1>Bienvenue sur DevGate</h1>
        <p class="subtitle">La plateforme pour suivre, valoriser et partager votre progression technique en tant que développeur.</p>
      </div>
      
      <div class="cta-buttons" v-if="!user">
        <RouterLink to="/signUp" class="btn btn-primary">Créer un compte</RouterLink>
        <RouterLink to="/Login" class="btn btn-secondary">Se connecter</RouterLink>
      </div>

      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <h3>Suivi de progression</h3>
          <p>Visualisez vos compétences, projets, objectifs et activité technique.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🤝</div>
          <h3>Collaboration</h3>
          <p>Partagez vos réalisations et collaborez sur des projets open-source.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🏆</div>
          <h3>Valorisation</h3>
          <p>Mettez en avant vos compétences et certifications auprès de la communauté.</p>
        </div>
      </div>
    </div>
  </div>
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

<style scoped>
.home-container {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(120deg, #1a1a1a 0%, #2d2d2d 100%);
}

.home-card {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem;
  text-align: center;
  background: rgba(51, 51, 51, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #444;
}

.home-header {
  margin-bottom: 3rem;
}

.home-header h1 {
  color: #e0e7ef;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  color: #a0aec0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  background: #444;
  color: #e0e7ef;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid #555;
}

.btn-primary:hover {
  background: #555;
  transform: translateY(-2px);
  border-color: #666;
}

.btn-secondary {
  background: #333;
  color: #e0e7ef;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s;
  border: 1px solid #444;
}

.btn-secondary:hover {
  background: #444;
  transform: translateY(-2px);
  border-color: #555;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #444;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  border-color: #555;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e0e7ef;
}

.feature-card h3 {
  color: #e0e7ef;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #a0aec0;
  line-height: 1.6;
  margin: 0;
}
</style>
