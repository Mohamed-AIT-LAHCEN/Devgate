<template>
  <div class="skill-tracker">
    <div class="skill-form" v-if="showForm">
      <h3>Add New Skill</h3>
      <form @submit.prevent="addSkill">
        <div class="form-group">
          <label for="skillName">Skill Name</label>
          <input 
            type="text" 
            id="skillName" 
            v-model="newSkill.name" 
            required
            placeholder="e.g., React, Vue, Node.js"
          >
        </div>
        
        <div class="form-group">
          <label for="skillLevel">Level</label>
          <select id="skillLevel" v-model="newSkill.level" required>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div class="form-group">
          <label for="acquisitionDate">Acquisition Date</label>
          <input 
            type="date" 
            id="acquisitionDate" 
            v-model="newSkill.acquisitionDate" 
            required
          >
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Add Skill</button>
          <button type="button" class="btn-secondary" @click="showForm = false">Cancel</button>
        </div>
      </form>
    </div>

    <div class="skills-list">
      <div class="skills-header">
        <h3>My Skills</h3>
        <button class="btn-primary" @click="showForm = true" v-if="!showForm">
          Add Skill
        </button>
      </div>

      <div class="skills-grid">
        <div v-for="skill in skills" :key="skill.id" class="skill-card">
          <div class="skill-info">
            <h4>{{ skill.name }}</h4>
            <span class="skill-level" :class="skill.level">
              {{ skill.level }}
            </span>
          </div>
          <div class="skill-date">
            Acquired: {{ formatDate(skill.acquisitionDate) }}
          </div>
          <div class="skill-actions">
            <button class="btn-edit" @click="editSkill(skill)">Edit</button>
            <button class="btn-delete" @click="deleteSkill(skill.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  where 
} from 'firebase/firestore'

export default {
  name: 'SkillTracker',
  setup() {
    const skills = ref([])
    const showForm = ref(false)
    const newSkill = ref({
      name: '',
      level: 'beginner',
      acquisitionDate: new Date().toISOString().split('T')[0]
    })

    const loadSkills = async () => {
      const user = auth.currentUser
      if (!user) return

      const skillsQuery = query(
        collection(db, 'skills'),
        where('userId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(skillsQuery)
      skills.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }

    const addSkill = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        if (newSkill.value.id) {
          // Update existing skill
          await updateDoc(doc(db, 'skills', newSkill.value.id), {
            ...newSkill.value,
            updatedAt: new Date()
          })
        } else {
          // Add new skill
          await addDoc(collection(db, 'skills'), {
            ...newSkill.value,
            userId: user.uid,
            createdAt: new Date()
          })
        }
        
        newSkill.value = {
          name: '',
          level: 'beginner',
          acquisitionDate: new Date().toISOString().split('T')[0]
        }
        showForm.value = false
        await loadSkills()
      } catch (error) {
        console.error('Error adding skill:', error)
      }
    }

    const deleteSkill = async (skillId) => {
      try {
        await deleteDoc(doc(db, 'skills', skillId))
        await loadSkills()
      } catch (error) {
        console.error('Error deleting skill:', error)
      }
    }

    const editSkill = (skill) => {
      newSkill.value = { ...skill }
      showForm.value = true
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    onMounted(() => {
      loadSkills()
    })

    return {
      skills,
      showForm,
      newSkill,
      addSkill,
      deleteSkill,
      editSkill,
      formatDate
    }
  }
}
</script>

<style scoped>
.skill-tracker {
  max-width: 1200px;
  margin: 0 auto;
}

.skill-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.skill-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.skill-level {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.skill-level.beginner {
  background: #e3f2fd;
  color: #1976d2;
}

.skill-level.intermediate {
  background: #fff3e0;
  color: #f57c00;
}

.skill-level.advanced {
  background: #e8f5e9;
  color: #388e3c;
}

.skill-date {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.skill-actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-secondary {
  background: #9e9e9e;
  color: white;
}

.btn-edit {
  background: #2196F3;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}
</style> 