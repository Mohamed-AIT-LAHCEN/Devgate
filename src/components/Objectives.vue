<template>
  <div class="objectives-container">
    <div class="card objectives-card">
      <h2 class="page-title">Mes Objectifs</h2>
      <div class="add-objective-section">
        <button v-if="!formVisible" @click="showAddForm" class="btn btn-primary">Ajouter un objectif</button>
      </div>
      <!-- Formulaire d'ajout -->
      <transition name="slide-fade">
        <div v-if="formVisible && editingIndex === -1">
          <div class="cancel-section">
            <button type="button" @click="hideForm" class="btn btn-cancel">Annuler</button>
          </div>
          <form @submit.prevent="addObjective" class="objective-form">
            <h3 class="form-title">Ajouter un objectif</h3>
            <div class="form-group">
              <label for="title">Titre</label>
              <input v-model="title" placeholder="Titre de l'objectif" required />
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <input v-model="description" placeholder="Description" required />
            </div>
            <div class="form-group">
              <label for="status">Statut</label>
              <select v-model="status">
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-submit">Ajouter</button>
            </div>
          </form>
        </div>
      </transition>
      <!-- Formulaire de modification -->
      <transition name="slide-fade">
        <div v-if="formVisible && editingIndex !== -1">
          <div class="cancel-section">
            <button type="button" @click="hideForm" class="btn btn-cancel">Annuler</button>
          </div>
          <form @submit.prevent="updateObjective" class="objective-form">
            <h3 class="form-title">Modifier l'objectif</h3>
            <div class="form-group">
              <label for="title">Titre</label>
              <input v-model="title" placeholder="Titre de l'objectif" required />
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <input v-model="description" placeholder="Description" required />
            </div>
            <div class="form-group">
              <label for="status">Statut</label>
              <select v-model="status">
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-submit">Mettre à jour</button>
            </div>
          </form>
        </div>
      </transition>
      <ul class="objectives-list">
        <li v-for="(obj, i) in objectives" :key="obj.id" class="objective-item">
          <span class="objective-title">{{ obj.title }}</span> -
          <span class="objective-desc">{{ obj.description }}</span>
          <span class="objective-status">({{ obj.status }})</span>
          <button @click="editObjective(i)" class="btn btn-edit">Modifier</button>
          <button @click="deleteObjective(obj.id)" class="btn btn-delete">Supprimer</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {ref, onMounted} from 'vue'
import {auth, db} from '../firebase'
import {collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc} from 'firebase/firestore'
import {onAuthStateChanged} from 'firebase/auth'
import { logTimelineAction } from './Timeline.vue'
export default {
  name: 'UserObjectives',
  setup() {
    const objectives = ref([])
    const title = ref("")
    const description = ref("")
    const status = ref("En cours")
    const editingIndex = ref(-1)
    const formVisible = ref(false)
    const fetchObjectives = async (uid) => {
      objectives.value = [];
      const q = query(collection(db, 'objectives'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(docSnap => objectives.value.push({id: docSnap.id, ...docSnap.data()}));
    }
    const resetForm = () => {
      title.value = "";
      description.value = "";
      status.value = "En cours";
      editingIndex.value = -1;
    }
    const showAddForm = () => {
      resetForm();
      formVisible.value = true;
    }
    const hideForm = () => {
      resetForm();
      formVisible.value = false;
    }
    const addObjective = async () => {
      if (!auth.currentUser) return;
      await addDoc(collection(db, 'objectives'), {
        title: title.value,
        description: description.value,
        status: status.value,
        userId: auth.currentUser.uid
      })
      await logTimelineAction({
        userId: auth.currentUser.uid,
        type: 'Ajout objectif',
        description: `Ajout de l'objectif ${title.value}`
      })
      resetForm();
      formVisible.value = false;
      fetchObjectives(auth.currentUser.uid)
    }
    const editObjective = (idx) => {
      editingIndex.value = idx;
      const obj = objectives.value[idx];
      title.value = obj.title;
      description.value = obj.description;
      status.value = obj.status;
      formVisible.value = true;
    }
    const updateObjective = async () => {
      if (editingIndex.value === -1) return;
      const obj = objectives.value[editingIndex.value];
      await updateDoc(doc(db, 'objectives', obj.id), {
        title: title.value,
        description: description.value,
        status: status.value
      })
      await logTimelineAction({
        userId: auth.currentUser.uid,
        type: 'Modification objectif',
        description: `Modification de l'objectif ${title.value}`
      })
      resetForm();
      formVisible.value = false;
      fetchObjectives(auth.currentUser.uid)
    }
    const deleteObjective = async (id) => {
      const obj = objectives.value.find(o => o.id === id);
      await deleteDoc(doc(db, 'objectives', id));
      await logTimelineAction({
        userId: auth.currentUser.uid,
        type: 'Suppression objectif',
        description: `Suppression de l'objectif ${obj ? obj.title : ''}`
      })
      fetchObjectives(auth.currentUser.uid)
    }
    onMounted(() => {
      onAuthStateChanged(auth, (u) => {
        if (u) fetchObjectives(u.uid);
      })
    })
    return { objectives, title, description, status, addObjective, editObjective, updateObjective, deleteObjective, editingIndex, formVisible, showAddForm, hideForm }
  }
}
</script> 

<style scoped>
.objectives-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.objectives-card {
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

.objective-form {
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
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 6px;
  background: #333;
  color: #e0e7ef;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
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

.objectives-list {
  list-style: none;
  padding: 0;
}

.objective-item {
  background: #222;
  border-radius: 8px;
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #e0e7ef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.objective-title {
  font-weight: bold;
}

.btn-edit {
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  margin-left: auto;
  margin-right: 0.5rem;
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

.add-objective-section {
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

.cancel-section {
  text-align: center;
  margin-bottom: 0.5rem;
}
</style> 