<template>
  <div class="timeline-container">
    <CreatePost
      :projects="projects"
      :objectives="objectives"
      :competitions="competitions"
      @create-project="createNewProject"
      @create-objective="createNewObjective"
      @create-competition="createNewCompetition"
    />
    
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="posts.length === 0" class="text-center py-4">
      <p class="text-muted">No posts yet. Follow some users to see their posts here!</p>
    </div>
    
    <div v-else class="posts-list">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @post-updated="loadPosts"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, getFeedPosts, getProjects, getObjectives, getCompetitions } from '../firebase';
import CreatePost from './CreatePost.vue';
import PostCard from './PostCard.vue';

export default {
  name: 'TimelineFeed',
  components: {
    CreatePost,
    PostCard
  },
  setup() {
    const router = useRouter();
    const posts = ref([]);
    const projects = ref([]);
    const objectives = ref([]);
    const competitions = ref([]);
    const loading = ref(true);

    const loadPosts = async () => {
      if (!auth.currentUser) return;
      
      try {
        loading.value = true;
        posts.value = await getFeedPosts(auth.currentUser.uid);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        loading.value = false;
      }
    };

    const loadProjects = async () => {
      try {
        projects.value = await getProjects();
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    const loadObjectives = async () => {
      try {
        objectives.value = await getObjectives();
      } catch (error) {
        console.error('Error loading objectives:', error);
      }
    };

    const loadCompetitions = async () => {
      try {
        competitions.value = await getCompetitions();
      } catch (error) {
        console.error('Error loading competitions:', error);
      }
    };

    const createNewProject = () => {
      router.push('/projects');
    };

    const createNewObjective = () => {
      router.push('/objectives');
    };

    const createNewCompetition = () => {
      router.push('/competitions');
    };

    onMounted(async () => {
      await Promise.all([
        loadPosts(),
        loadProjects(),
        loadObjectives(),
        loadCompetitions()
      ]);
    });

    return {
      posts,
      projects,
      objectives,
      competitions,
      loading,
      loadPosts,
      createNewProject,
      createNewObjective,
      createNewCompetition
    };
  }
};
</script>

<style scoped>
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.posts-list {
  margin-top: 2rem;
}

.spinner-border {
  color: var(--dg-blue);
}

.text-muted {
  color: var(--dg-gray) !important;
}
</style> 