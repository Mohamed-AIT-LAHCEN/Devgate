<template>
  <div class="project-manager">
    <div class="project-form" v-if="showForm">
      <h3>{{ editingProject ? 'Edit Project' : 'Add New Project' }}</h3>
      <form @submit.prevent="saveProject">
        <div class="form-group">
          <label for="projectTitle">Project Title</label>
          <input 
            type="text" 
            id="projectTitle" 
            v-model="projectData.title" 
            required
            placeholder="Enter project title"
          >
        </div>

        <div class="form-group">
          <label for="projectDescription">Description</label>
          <textarea 
            id="projectDescription" 
            v-model="projectData.description" 
            required
            rows="4"
            placeholder="Describe your project"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Tech Stack</label>
          <div class="tech-stack-input">
            <input 
              type="text" 
              v-model="newTech" 
              @keyup.enter="addTech"
              placeholder="Add technology and press Enter"
            >
            <button type="button" @click="addTech" class="btn-add">Add</button>
          </div>
          <div class="tech-tags">
            <span 
              v-for="(tech, index) in projectData.techStack" 
              :key="index"
              class="tech-tag"
            >
              {{ tech }}
              <button 
                type="button" 
                @click="removeTech(index)"
                class="remove-tech"
              >&times;</button>
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="githubLink">GitHub Link</label>
          <input 
            type="url" 
            id="githubLink" 
            v-model="projectData.githubLink" 
            placeholder="https://github.com/username/repo"
          >
        </div>

        <div class="form-group">
          <label for="projectImage">Project Image</label>
          <input 
            type="file" 
            id="projectImage" 
            @change="handleImageUpload" 
            accept="image/*"
          >
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Project preview">
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            {{ editingProject ? 'Update Project' : 'Add Project' }}
          </button>
          <button type="button" class="btn-secondary" @click="cancelEdit">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <div class="projects-container">
      <div class="projects-header">
        <h3>My Projects</h3>
        <div class="view-controls">
          <button 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            Grid
          </button>
          <button 
            :class="['view-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            List
          </button>
          <button class="btn-primary" @click="showForm = true" v-if="!showForm">
            Add Project
          </button>
        </div>
      </div>

      <div :class="['projects-display', viewMode]">
        <div v-for="project in projects" :key="project.id" class="project-card">
          <div class="project-image" v-if="project.imageUrl">
            <img :src="project.imageUrl" :alt="project.title">
          </div>
          <div class="project-content">
            <h4>{{ project.title }}</h4>
            <p class="project-description">{{ project.description }}</p>
            <div class="tech-stack">
              <span 
                v-for="(tech, index) in project.techStack" 
                :key="index"
                class="tech-tag"
              >
                {{ tech }}
              </span>
            </div>
            <div class="project-links">
              <a 
                v-if="project.githubLink" 
                :href="project.githubLink" 
                target="_blank"
                class="github-link"
              >
                View on GitHub
              </a>
            </div>
            <div class="project-actions">
              <button class="btn-edit" @click="editProject(project)">Edit</button>
              <button class="btn-delete" @click="deleteProject(project.id)">Delete</button>
            </div>
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
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export default {
  name: 'ProjectManager',
  setup() {
    const projects = ref([])
    const showForm = ref(false)
    const viewMode = ref('grid')
    const editingProject = ref(null)
    const imagePreview = ref(null)
    const newTech = ref('')
    
    const projectData = ref({
      title: '',
      description: '',
      techStack: [],
      githubLink: '',
      imageUrl: ''
    })

    const loadProjects = async () => {
      const user = auth.currentUser
      if (!user) return

      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid)
      )
      
      const querySnapshot = await getDocs(projectsQuery)
      projects.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        imagePreview.value = URL.createObjectURL(file)
      }
    }

    const uploadImage = async (file) => {
      const storage = getStorage()
      const imageRef = storageRef(storage, `projects/${Date.now()}_${file.name}`)
      await uploadBytes(imageRef, file)
      return await getDownloadURL(imageRef)
    }

    const saveProject = async () => {
      const user = auth.currentUser
      if (!user) return

      try {
        const projectToSave = { ...projectData.value }
        
        // Handle image upload if there's a new image
        if (imagePreview.value && !imagePreview.value.startsWith('http')) {
          const fileInput = document.getElementById('projectImage')
          if (fileInput && fileInput.files[0]) {
            projectToSave.imageUrl = await uploadImage(fileInput.files[0])
          }
        }
        
        if (editingProject.value) {
          await updateDoc(doc(db, 'projects', editingProject.value.id), {
            ...projectToSave,
            updatedAt: new Date()
          })
        } else {
          await addDoc(collection(db, 'projects'), {
            ...projectToSave,
            userId: user.uid,
            createdAt: new Date()
          })
        }

        resetForm()
        await loadProjects()
      } catch (error) {
        console.error('Error saving project:', error)
      }
    }

    const deleteProject = async (projectId) => {
      try {
        await deleteDoc(doc(db, 'projects', projectId))
        await loadProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }

    const editProject = (project) => {
      editingProject.value = project
      projectData.value = { ...project }
      imagePreview.value = project.imageUrl
      showForm.value = true
    }

    const cancelEdit = () => {
      resetForm()
    }

    const resetForm = () => {
      projectData.value = {
        title: '',
        description: '',
        techStack: [],
        githubLink: '',
        imageUrl: ''
      }
      editingProject.value = null
      imagePreview.value = null
      showForm.value = false
    }

    const addTech = () => {
      if (newTech.value.trim()) {
        projectData.value.techStack.push(newTech.value.trim())
        newTech.value = ''
      }
    }

    const removeTech = (index) => {
      projectData.value.techStack.splice(index, 1)
    }

    onMounted(() => {
      loadProjects()
    })

    return {
      projects,
      showForm,
      viewMode,
      editingProject,
      projectData,
      imagePreview,
      newTech,
      saveProject,
      deleteProject,
      editProject,
      cancelEdit,
      handleImageUpload,
      addTech,
      removeTech
    }
  }
}
</script>

<style scoped>
.project-manager {
  max-width: 1200px;
  margin: 0 auto;
}

.project-form {
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
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.tech-stack-input {
  display: flex;
  gap: 0.5rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tech-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-tech {
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  padding: 0;
  font-size: 1.2rem;
}

.image-preview {
  margin-top: 1rem;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.view-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.projects-display {
  display: grid;
  gap: 1.5rem;
}

.projects-display.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.projects-display.list {
  grid-template-columns: 1fr;
}

.project-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-image {
  height: 200px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-content {
  padding: 1rem;
}

.project-description {
  color: #666;
  margin: 0.5rem 0;
}

.project-links {
  margin: 1rem 0;
}

.github-link {
  color: #1976d2;
  text-decoration: none;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

.btn-add {
  background: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
}
</style> 