<template>
    <div class="skills-container">
        <div class="card">
            <h2 class="page-title">Gestion des Compétences</h2>
            <div class="add-skill-section">
                <button @click="ajouter()" class="btn btn-primary">
                    {{ val ? 'Annuler' : 'Ajouter une compétence' }}
                </button>
            </div>
            <!-- Formulaire d'ajout -->
            <transition name="slide-fade">
                <form v-if="val && editingIndex === -1" @submit.prevent="addComp()" class="skill-form">
                    <h3 class="form-title">Ajouter une nouvelle compétence</h3>
                    <div class="form-group">
                        <label for="titre">Titre de la compétence</label>
                        <input type="text" v-model="titre" placeholder="Ex: React, Git, Docker..." required>
                    </div>
                    <div class="form-group">
                        <label for="niveau">Niveau</label>
                        <select v-model="niveau" required>
                            <option value="">Sélectionner un niveau</option>
                            <option value="Débutant">Débutant</option>
                            <option value="Intermédiaire">Intermédiaire</option>
                            <option value="Avancé">Avancé</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dateac">Date d'acquisition</label>
                        <input type="date" v-model="dateac" required>
                    </div>
                    <div class="form-group">
                        <label for="datepr">Date de progression</label>
                        <input type="date" v-model="datepr" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-submit">Ajouter</button>
                    </div>
                </form>
            </transition>
            <!-- Formulaire de modification -->
            <transition name="slide-fade">
                <form v-if="val && editingIndex !== -1" @submit.prevent="updateComp()" class="skill-form">
                    <h3 class="form-title">Modifier la compétence</h3>
                    <div class="form-group">
                        <label for="titre">Titre de la compétence</label>
                        <input type="text" v-model="titre" placeholder="Ex: React, Git, Docker..." required>
                    </div>
                    <div class="form-group">
                        <label for="niveau">Niveau</label>
                        <select v-model="niveau" required>
                            <option value="">Sélectionner un niveau</option>
                            <option value="Débutant">Débutant</option>
                            <option value="Intermédiaire">Intermédiaire</option>
                            <option value="Avancé">Avancé</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dateac">Date d'acquisition</label>
                        <input type="date" v-model="dateac" required>
                    </div>
                    <div class="form-group">
                        <label for="datepr">Date de progression</label>
                        <input type="date" v-model="datepr" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-submit">Mettre à jour</button>
                    </div>
                </form>
            </transition>
            <!-- Liste des compétences -->
            <div class="skills-grid">
                <div v-for="(compe, i) in listCompetence" :key="compe.id" class="skill-card">
                    <div class="skill-header">
                        <h3>{{ compe.titre }}</h3>
                        <div class="skill-actions">
                            <button @click="editComp(i)" class="btn btn-edit">Modifier</button>
                            <button @click="deleteComp(compe.id)" class="btn btn-delete">Supprimer</button>
                        </div>
                    </div>
                    <div class="skill-details">
                        <div class="skill-level">
                            <span class="label">Niveau :</span>
                            <span class="value" :class="getLevelClass(compe.niveau)">{{ compe.niveau }}</span>
                        </div>
                        <div class="skill-dates">
                            <div class="date-item">
                                <span class="label">Acquise le :</span>
                                <span class="value">{{ formatDate(compe.date_acquisition) }}</span>
                            </div>
                            <div class="date-item">
                                <span class="label">Progression le :</span>
                                <span class="value">{{ formatDate(compe.date_progression) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {ref, onMounted} from 'vue'
import {db, auth} from '../firebase'
import {addDoc, collection, getDocs, query, where, doc, updateDoc, deleteDoc} from 'firebase/firestore' 
import {onAuthStateChanged} from 'firebase/auth'
import { logTimelineAction } from '../utils/timeline'

export default {
    name: 'SkillsManagement',
    setup() {
        const titre = ref("")
        const niveau = ref("")
        const dateac = ref("")
        const datepr = ref("")
        const val = ref(false)
        const listCompetence = ref([])
        const editingIndex = ref(-1)

        const ajouter = () => {
            val.value = !val.value;
            if (!val.value) {
                resetForm();
            }
        };

        const resetForm = () => {
            titre.value = "";
            niveau.value = "";
            dateac.value = "";
            datepr.value = "";
        };

        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        const getLevelClass = (level) => {
            return {
                'level-beginner': level === 'Débutant',
                'level-intermediate': level === 'Intermédiaire',
                'level-advanced': level === 'Avancé'
            };
        };

        const addComp = async () => {
            if (!auth.currentUser) return;
            
            // Validation des dates
            if (new Date(datepr.value) < new Date(dateac.value)) {
                alert("La date de progression doit être postérieure à la date d'acquisition");
                return;
            }

            await addDoc(collection(db, "Compétence"), {
                titre: titre.value,
                niveau: niveau.value,
                date_acquisition: dateac.value,
                date_progression: datepr.value,
                userId: auth.currentUser.uid
            });

            await logTimelineAction({
                userId: auth.currentUser.uid,
                type: 'Ajout compétence',
                description: `Ajout de la compétence ${titre.value}`
            });

            resetForm();
            val.value = false;
            getData();
        };

        const editComp = (idx) => {
            editingIndex.value = idx;
            const comp = listCompetence.value[idx];
            titre.value = comp.titre;
            niveau.value = comp.niveau;
            dateac.value = comp.date_acquisition;
            datepr.value = comp.date_progression;
            val.value = true;
            // Scroll vers le formulaire
            setTimeout(() => {
                const form = document.querySelector('.skill-form');
                if (form) {
                    form.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        };

        const updateComp = async () => {
            if (editingIndex.value === -1) return;

            // Validation des dates
            if (new Date(datepr.value) < new Date(dateac.value)) {
                alert("La date de progression doit être postérieure à la date d'acquisition");
                return;
            }

            const comp = listCompetence.value[editingIndex.value];
            await updateDoc(doc(db, 'Compétence', comp.id), {
                titre: titre.value,
                niveau: niveau.value,
                date_acquisition: dateac.value,
                date_progression: datepr.value
            });

            await logTimelineAction({
                userId: auth.currentUser.uid,
                type: 'Modification compétence',
                description: `Modification de la compétence ${titre.value}`
            });

            resetForm();
            val.value = false;
            getData();
        };

        const deleteComp = async (id) => {
            if (!confirm("Êtes-vous sûr de vouloir supprimer cette compétence ?")) return;
            
            const comp = listCompetence.value.find(c => c.id === id);
            await deleteDoc(doc(db, 'Compétence', id));
            
            await logTimelineAction({
                userId: auth.currentUser.uid,
                type: 'Suppression compétence',
                description: `Suppression de la compétence ${comp ? comp.titre : ''}`
            });
            
            getData();
        };

        const getData = async () => {
            if (!auth.currentUser) return;
            listCompetence.value = [];
            const q = query(collection(db, "Compétence"), where("userId", "==", auth.currentUser.uid));
            const listComp = await getDocs(q);
            listComp.forEach((comp) => {
                listCompetence.value.push({id: comp.id, ...comp.data()});
            });
        };

        onMounted(() => {
            onAuthStateChanged(auth, (u) => {
                if (u) getData();
            });
        });

        return {
            titre,
            niveau,
            dateac,
            datepr,
            ajouter,
            addComp,
            val,
            listCompetence,
            editComp,
            updateComp,
            deleteComp,
            editingIndex,
            formatDate,
            getLevelClass
        }
    }
}
</script>

<style scoped>
.skills-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.page-title {
    color: #e0e7ef;
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.skill-card {
    background: #333;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.skill-card:hover {
    transform: translateY(-5px);
}

.skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.skill-header h3 {
    color: #e0e7ef;
    margin: 0;
    font-size: 1.2rem;
}

.skill-actions {
    display: flex;
    gap: 0.5rem;
}

.skill-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.skill-level {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.skill-dates {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.date-item {
    display: flex;
    gap: 0.5rem;
}

.label {
    color: #888;
    font-size: 0.9rem;
}

.value {
    color: #e0e7ef;
}

.level-beginner {
    color: #4CAF50;
}

.level-intermediate {
    color: #2196F3;
}

.level-advanced {
    color: #FF9800;
}

.add-skill-section {
    text-align: center;
    margin: 2rem 0;
}

.skill-form {
    background: #2d2d2d;
    padding: 2rem;
    border-radius: 12px;
    margin-top: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #444;
    color: #e0e7ef;
}

.btn-primary:hover {
    background: #555;
}

.btn-edit {
    background: #2196F3;
    color: white;
}

.btn-edit:hover {
    background: #1976D2;
}

.btn-delete {
    background: #f44336;
    color: white;
}

.btn-delete:hover {
    background: #d32f2f;
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn-submit {
    background: #4CAF50;
    color: white;
}

.btn-submit:hover {
    background: #388E3C;
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

.form-title {
    color: #e0e7ef;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    text-align: center;
}
</style>