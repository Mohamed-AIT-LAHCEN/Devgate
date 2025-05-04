<template>
  <div class="timeline-container">
    <h2 class="timeline-title">Timeline d'activité</h2>
    <div class="timeline-list">
      <div v-for="(item, i) in timeline" :key="i" class="timeline-item">
        <div class="timeline-date">{{ formatDate(item.date) }}</div>
        <div class="timeline-content">
          <span class="timeline-type">{{ item.type }}</span>
          <p class="timeline-description">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, onMounted} from 'vue'
import {auth, db} from '../firebase'
import {collection, query, where, getDocs, addDoc} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
export default {
  name: 'UserTimeline',
  setup() {
    const timeline = ref([])
    const fetchTimeline = async (uid) => {
      timeline.value = [];
      const q = query(collection(db, 'timeline'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach(doc => items.push(doc.data()));
      // Sort items by date in descending order
      timeline.value = items.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    onMounted(() => {
      onAuthStateChanged(auth, (u) => {
        if (u) fetchTimeline(u.uid);
      })
    })
    return { timeline, formatDate }
  }
}

export async function logTimelineAction({ userId, type, description }) {
  await addDoc(collection(db, 'timeline'), {
    userId,
    type,
    description,
    date: new Date().toISOString()
  })
}
</script>

<style scoped>
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.timeline-title {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
}

.timeline-list {
  position: relative;
  padding-left: 2rem;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e7ef;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 1.5rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #42b983;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #42b983;
}

.timeline-date {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.timeline-content {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.06);
}

.timeline-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0e7ef;
  color: #2c3e50;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.timeline-description {
  color: #4a5568;
  margin: 0;
  line-height: 1.5;
}
</style> 