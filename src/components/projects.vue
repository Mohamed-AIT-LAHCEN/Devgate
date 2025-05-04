<template>
  <div class="projects-container">
    <div class="card projects-card">
      <h2 class="page-title">Mes Projets</h2>
      <div class="add-project-section">
        <button v-if="!formVisible" @click="showAddForm" class="btn btn-primary">Ajouter un projet</button>
      </div>
      <!-- Formulaire d'ajout/modification -->
      <transition name="slide-fade">
        <div v-if="formVisible">
          <div class="cancel-section">
            <button type="button" @click="hideForm" class="btn btn-cancel">Annuler</button>
          </div>
          <form @submit.prevent="editingIndex === -1 ? addProject() : updateProject()" class="project-form">
            <h3 class="form-title">{{ editingIndex === -1 ? 'Ajouter un projet' : 'Modifier le projet' }}</h3>
            <div class="form-group">
              <label for="title">Titre</label>
              <input type="text" v-model="title" required />
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea v-model="description" required></textarea>
            </div>
            <div class="form-group">
              <label for="stack">Stack utilisés</label>
              <button type="button" @click="addStack" class="btn btn-success">Ajouter un stack</button>
              <div v-for="(stack, i) in stacks" :key="i">
                <input type="text" v-model="stacks[i]" placeholder="Ajouter un stack" required />
              </div>
            </div>
            <div class="form-group">
              <label for="github">Lien github</label>
              <input type="text" v-model="github" required />
            </div>
            <div class="form-group">
              <label for="image">Image du projet</label>
              <input type="file" @change="handleImage" accept="image/*" />
              <img v-if="imagePreview" :src="imagePreview" alt="Aperçu image" class="preview-image" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-submit">{{ editingIndex === -1 ? 'Ajouter' : 'Mettre à jour' }}</button>
            </div>
            <div v-if="error" class="error-message">{{ error }}</div>
          </form>
        </div>
      </transition>
      <!-- Liste des projets -->
      <div class="projects-list">
        <div v-for="(proj, i) in projects" :key="proj.id" class="project-item">
          <div class="project-info">
            <h3>{{ proj.title }}</h3>
            <p>{{ proj.description }}</p>
            <p><strong>Stack :</strong> {{ Array.isArray(proj.stacks) ? proj.stacks.join(', ') : '' }}</p>
            <p><strong>Github :</strong> <a :href="proj.github" target="_blank">{{ proj.github }}</a></p>
            <img v-if="proj.imageUrl" :src="proj.imageUrl" alt="project image" class="project-image" />
          </div>
          <div class="project-actions">
            <button @click="editProject(i)" class="btn btn-edit">Modifier</button>
            <button @click="deleteProject(proj.id)" class="btn btn-delete">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {db} from '../firebase'
import { addDoc, collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {ref, onMounted} from 'vue'
import {auth} from '../firebase'
import {query, where, getDocs} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { logTimelineAction } from '../utils/timeline'
export default {
    name: 'ProjectsView',
    setup() {
        const title = ref("")
        const description = ref("")
        const stacks = ref([])
        const github = ref("")
        const projects = ref([])
        const editingIndex = ref(-1)
        const imageFile = ref(null)
        const imageUrl = ref("")
        const imagePreview = ref("")
        const formVisible = ref(false)
        const error = ref("")
        const addStack = () => {
            stacks.value.push("");
        }
        const handleImage = (e) => {
            imageFile.value = e.target.files[0];
            if (imageFile.value) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    imagePreview.value = ev.target.result;
                };
                reader.readAsDataURL(imageFile.value);
            } else {
                imagePreview.value = "";
            }
        }
        const resetForm = () => {
            title.value = "";
            description.value = "";
            stacks.value = [];
            github.value = "";
            imageFile.value = null;
            imageUrl.value = "";
            imagePreview.value = "";
            editingIndex.value = -1;
            error.value = "";
        }
        const showAddForm = () => {
            resetForm();
            formVisible.value = true;
        }
        const hideForm = () => {
            resetForm();
            formVisible.value = false;
        }
        const addProject = async () => {
            error.value = "";
            if (!auth.currentUser) {
                error.value = 'Vous devez être connecté pour ajouter un projet.';
                return;
            }
            let url = "";
            try {
                if (imageFile.value) {
                    try {
                        const storage = getStorage();
                        const imgRef = storageRef(storage, `projects/${auth.currentUser.uid}/${Date.now()}_${imageFile.value.name}`);
                        const snapshot = await uploadBytes(imgRef, imageFile.value);
                        url = await getDownloadURL(snapshot.ref);
                    } catch (imgErr) {
                        console.error('Erreur upload image:', imgErr);
                        error.value = 'Erreur lors de l\'upload de l\'image. Veuillez réessayer.';
                        return;
                    }
                }

                const projectData = {
                    title: title.value,
                    description: description.value,
                    stacks: stacks.value,
                    github: github.value,
                    imageUrl: url,
                    userId: auth.currentUser.uid,
                    createdAt: new Date()
                };

                const docRef = await addDoc(collection(db, 'projects'), projectData);
                console.log('Projet créé avec ID:', docRef.id);

                await logTimelineAction({
                    userId: auth.currentUser.uid,
                    type: 'Ajout projet',
                    description: `Ajout du projet ${title.value}`
                });

                resetForm();
                formVisible.value = false;
                await getUserProjects();
            } catch (err) {
                console.error('Erreur création projet:', err);
                error.value = 'Erreur lors de l\'ajout du projet. Veuillez réessayer.';
            }
        }
        const getUserProjects = async () => {
            if (!auth.currentUser) return;
            projects.value = [];
            const q = query(collection(db, 'projects'), where('userId', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docSnap) => {
                projects.value.push({id: docSnap.id, ...docSnap.data()});
            });
        }
        const editProject = (idx) => {
            editingIndex.value = idx;
            const proj = projects.value[idx];
            title.value = proj.title;
            description.value = proj.description;
            stacks.value = Array.isArray(proj.stacks) ? [...proj.stacks] : [];
            github.value = proj.github;
            imageUrl.value = proj.imageUrl || "";
            imagePreview.value = proj.imageUrl || "";
            formVisible.value = true;
        }
        const updateProject = async () => {
            error.value = "";
            if (editingIndex.value === -1) return;
            let url = imageUrl.value;
            try {
                if (imageFile.value) {
                    try {
                        const storage = getStorage();
                        const imgRef = storageRef(storage, `projects/${auth.currentUser.uid}/${Date.now()}_${imageFile.value.name}`);
                        const snapshot = await uploadBytes(imgRef, imageFile.value);
                        url = await getDownloadURL(snapshot.ref);
                    } catch (imgErr) {
                        console.error('Erreur upload image:', imgErr);
                        error.value = 'Erreur lors de l\'upload de l\'image. Veuillez réessayer.';
                        return;
                    }
                }

                const proj = projects.value[editingIndex.value];
                const updateData = {
                    title: title.value,
                    description: description.value,
                    stacks: stacks.value,
                    github: github.value,
                    imageUrl: url,
                    updatedAt: new Date()
                };

                await updateDoc(doc(db, 'projects', proj.id), updateData);
                console.log('Projet mis à jour:', proj.id);

                await logTimelineAction({
                    userId: auth.currentUser.uid,
                    type: 'Modification projet',
                    description: `Modification du projet ${title.value}`
                });

                resetForm();
                formVisible.value = false;
                await getUserProjects();
            } catch (err) {
                console.error('Erreur mise à jour projet:', err);
                error.value = 'Erreur lors de la mise à jour du projet. Veuillez réessayer.';
            }
        }
        const deleteProject = async (id) => {
            const proj = projects.value.find(p => p.id === id);
            await deleteDoc(doc(db, 'projects', id));
            await logTimelineAction({
                userId: auth.currentUser.uid,
                type: 'Suppression projet',
                description: `Suppression du projet ${proj ? proj.title : ''}`
            })
            getUserProjects();
        }
        onMounted(() => {
            onAuthStateChanged(auth, (u) => {
                if (u) getUserProjects();
            });
        });
        return {
            title,
            description,
            stacks,
            github,
            addStack,
            addProject,
            projects,
            editProject,
            updateProject,
            deleteProject,
            editingIndex,
            handleImage,
            imageFile,
            imageUrl,
            imagePreview,
            formVisible,
            showAddForm,
            hideForm,
            error
        }
    }
}
</script>

<style scoped>
.projects-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}
.projects-card {
  background: #333;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
  padding: 2rem 2.5rem;
  margin: 1rem auto;
}
.page-title {
  color: #e0e7ef;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}
.add-project-section {
  text-align: center;
  margin-bottom: 2rem;
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
.cancel-section {
  text-align: center;
  margin-bottom: 0.5rem;
}
.btn-cancel {
  background: #666;
  color: white;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #777;
}
.project-form {
  background: #2d2d2d;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.form-title {
  color: #e0e7ef;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e0e7ef;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 6px;
  background: #333;
  color: #e0e7ef;
  font-size: 1rem;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #666;
  box-shadow: 0 0 0 2px rgba(102, 102, 102, 0.2);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
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
.preview-image {
  max-width: 180px;
  margin-top: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
  display: block;
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
.projects-list {
  margin-top: 2rem;
}
.project-item {
  background: #222;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #e0e7ef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.project-info h3 {
  margin: 0 0 0.5rem 0;
  color: #e0e7ef;
}
.project-info p {
  margin: 0.2rem 0;
}
.project-image {
  max-width: 200px;
  margin-top: 1rem;
  border-radius: 8px;
  border: 1px solid #444;
}
.project-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-edit {
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-edit:hover {
  background: #1976D2;
}
.btn-delete {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-delete:hover {
  background: #d32f2f;
}
/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style> 