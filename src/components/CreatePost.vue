<template>
  <div class="card mb-4">
    <div class="card-body">
      <textarea
        v-model="content"
        placeholder="What's on your mind?"
        class="form-control mb-3"
        rows="3"
      ></textarea>
      
      <div class="mb-3">
        <div class="d-flex align-items-center mb-2">
          <label class="me-2 mb-0">Add to post:</label>
          <div class="btn-group">
            <button @click="toggleProjectSelect" class="btn btn-outline-secondary" :class="{ 'active': showProjectSelect }">
              <i class="fas fa-project-diagram"></i> Project
            </button>
            <button @click="toggleObjectiveSelect" class="btn btn-outline-secondary" :class="{ 'active': showObjectiveSelect }">
              <i class="fas fa-bullseye"></i> Objective
            </button>
            <button @click="toggleCompetitionSelect" class="btn btn-outline-secondary" :class="{ 'active': showCompetitionSelect }">
              <i class="fas fa-trophy"></i> Competition
            </button>
          </div>
        </div>

        <div v-if="showProjectSelect" class="mb-3">
          <div class="input-group">
            <input
              v-model="projectSearch"
              type="text"
              class="form-control"
              placeholder="Search projects..."
              @input="filterProjects"
            />
            <button class="btn btn-outline-secondary" type="button" @click="createNewProject">
              <i class="fas fa-plus"></i> New
            </button>
          </div>
          <div v-if="filteredProjects.length > 0" class="list-group mt-2">
            <button
              v-for="project in filteredProjects"
              :key="project.id"
              class="list-group-item list-group-item-action"
              @click="selectProject(project)"
            >
              {{ project.title }}
            </button>
          </div>
        </div>

        <div v-if="showObjectiveSelect" class="mb-3">
          <div class="input-group">
            <input
              v-model="objectiveSearch"
              type="text"
              class="form-control"
              placeholder="Search objectives..."
              @input="filterObjectives"
            />
            <button class="btn btn-outline-secondary" type="button" @click="createNewObjective">
              <i class="fas fa-plus"></i> New
            </button>
          </div>
          <div v-if="filteredObjectives.length > 0" class="list-group mt-2">
            <button
              v-for="objective in filteredObjectives"
              :key="objective.id"
              class="list-group-item list-group-item-action"
              @click="selectObjective(objective)"
            >
              {{ objective.title }}
            </button>
          </div>
        </div>

        <div v-if="showCompetitionSelect" class="mb-3">
          <div class="input-group">
            <input
              v-model="competitionSearch"
              type="text"
              class="form-control"
              placeholder="Search competitions..."
              @input="filterCompetitions"
            />
            <button class="btn btn-outline-secondary" type="button" @click="createNewCompetition">
              <i class="fas fa-plus"></i> New
            </button>
          </div>
          <div v-if="filteredCompetitions.length > 0" class="list-group mt-2">
            <button
              v-for="competition in filteredCompetitions"
              :key="competition.id"
              class="list-group-item list-group-item-action"
              @click="selectCompetition(competition)"
            >
              {{ competition.title }}
            </button>
          </div>
        </div>

        <div class="d-flex align-items-center">
          <input
            type="file"
            ref="fileInput"
            @change="handleImageUpload"
            accept="image/*"
            class="d-none"
          />
          <button @click="$refs.fileInput.click()" class="btn btn-outline-secondary me-3">
            <i class="fas fa-image"></i> Add Image
          </button>
          <img v-if="imagePreview" :src="imagePreview" class="img-thumbnail" style="max-width: 100px; max-height: 100px;" />
        </div>
      </div>

      <div v-if="hasSelectedItems" class="mb-3">
        <div v-if="selectedProject" class="badge bg-info me-2 mb-2">
          Project: {{ selectedProject.title }}
          <button @click="selectedProject = null" class="btn-close btn-close-white ms-2" style="font-size: 0.5rem;"></button>
        </div>
        <div v-if="selectedObjective" class="badge bg-success me-2 mb-2">
          Objective: {{ selectedObjective.title }}
          <button @click="selectedObjective = null" class="btn-close btn-close-white ms-2" style="font-size: 0.5rem;"></button>
        </div>
        <div v-if="selectedCompetition" class="badge bg-warning text-dark me-2 mb-2">
          Competition: {{ selectedCompetition.title }}
          <button @click="selectedCompetition = null" class="btn-close btn-close-white ms-2" style="font-size: 0.5rem;"></button>
        </div>
      </div>

      <button @click="createPost" class="btn btn-primary w-100" :disabled="!canSubmit">
        Post
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { auth, storage, createPost as createPostInFirebase } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'CreatePost',
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    objectives: {
      type: Array,
      default: () => []
    },
    competitions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['create-project', 'create-objective', 'create-competition', 'post-created'],
  setup(props, { emit }) {
    const content = ref('');
    const imageFile = ref(null);
    const imagePreview = ref(null);
    const showProjectSelect = ref(false);
    const showObjectiveSelect = ref(false);
    const showCompetitionSelect = ref(false);
    const selectedProject = ref(null);
    const selectedObjective = ref(null);
    const selectedCompetition = ref(null);
    const projectSearch = ref('');
    const objectiveSearch = ref('');
    const competitionSearch = ref('');

    const filteredProjects = computed(() => {
      if (!projectSearch.value) return props.projects;
      return props.projects.filter(project => 
        project.title.toLowerCase().includes(projectSearch.value.toLowerCase())
      );
    });

    const filteredObjectives = computed(() => {
      if (!objectiveSearch.value) return props.objectives;
      return props.objectives.filter(objective => 
        objective.title.toLowerCase().includes(objectiveSearch.value.toLowerCase())
      );
    });

    const filteredCompetitions = computed(() => {
      if (!competitionSearch.value) return props.competitions;
      return props.competitions.filter(competition => 
        competition.title.toLowerCase().includes(competitionSearch.value.toLowerCase())
      );
    });

    const hasSelectedItems = computed(() => {
      return selectedProject.value || selectedObjective.value || selectedCompetition.value;
    });

    const canSubmit = computed(() => {
      return content.value.trim() || imageFile.value || hasSelectedItems.value;
    });

    const toggleProjectSelect = () => {
      showProjectSelect.value = !showProjectSelect.value;
      showObjectiveSelect.value = false;
      showCompetitionSelect.value = false;
    };

    const toggleObjectiveSelect = () => {
      showObjectiveSelect.value = !showObjectiveSelect.value;
      showProjectSelect.value = false;
      showCompetitionSelect.value = false;
    };

    const toggleCompetitionSelect = () => {
      showCompetitionSelect.value = !showCompetitionSelect.value;
      showProjectSelect.value = false;
      showObjectiveSelect.value = false;
    };

    const selectProject = (project) => {
      selectedProject.value = project;
      showProjectSelect.value = false;
      projectSearch.value = '';
    };

    const selectObjective = (objective) => {
      selectedObjective.value = objective;
      showObjectiveSelect.value = false;
      objectiveSearch.value = '';
    };

    const selectCompetition = (competition) => {
      selectedCompetition.value = competition;
      showCompetitionSelect.value = false;
      competitionSearch.value = '';
    };

    const createNewProject = () => {
      emit('create-project');
      showProjectSelect.value = false;
    };

    const createNewObjective = () => {
      emit('create-objective');
      showObjectiveSelect.value = false;
    };

    const createNewCompetition = () => {
      emit('create-competition');
      showCompetitionSelect.value = false;
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        imageFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const uploadImage = async () => {
      if (!imageFile.value) return null;
      
      const imageRef = storageRef(storage, `posts/${Date.now()}_${imageFile.value.name}`);
      await uploadBytes(imageRef, imageFile.value);
      return getDownloadURL(imageRef);
    };

    const createPost = async () => {
      if (!auth.currentUser) return;

      try {
        let imageUrl = null;
        if (imageFile.value) {
          imageUrl = await uploadImage();
        }

        const postData = {
          content: content.value,
          image: imageUrl,
          authorId: auth.currentUser.uid,
          authorName: auth.currentUser.displayName,
          authorAvatar: auth.currentUser.photoURL,
          project: selectedProject.value,
          objective: selectedObjective.value,
          competition: selectedCompetition.value,
          createdAt: new Date()
        };

        await createPostInFirebase(postData);
        emit('post-created');
        
        // Reset form
        content.value = '';
        imageFile.value = null;
        imagePreview.value = null;
        selectedProject.value = null;
        selectedObjective.value = null;
        selectedCompetition.value = null;
        showProjectSelect.value = false;
        showObjectiveSelect.value = false;
        showCompetitionSelect.value = false;
      } catch (error) {
        console.error('Error creating post:', error);
      }
    };

    return {
      content,
      imagePreview,
      showProjectSelect,
      showObjectiveSelect,
      showCompetitionSelect,
      selectedProject,
      selectedObjective,
      selectedCompetition,
      projectSearch,
      objectiveSearch,
      competitionSearch,
      filteredProjects,
      filteredObjectives,
      filteredCompetitions,
      hasSelectedItems,
      canSubmit,
      toggleProjectSelect,
      toggleObjectiveSelect,
      toggleCompetitionSelect,
      selectProject,
      selectObjective,
      selectCompetition,
      createNewProject,
      createNewObjective,
      createNewCompetition,
      handleImageUpload,
      createPost
    };
  }
};
</script>

<style scoped>
.btn-group .btn.active {
  background-color: var(--dg-blue);
  color: white;
}

.list-group-item {
  cursor: pointer;
}

.list-group-item:hover {
  background-color: var(--dg-blue);
  color: white;
}
</style> 