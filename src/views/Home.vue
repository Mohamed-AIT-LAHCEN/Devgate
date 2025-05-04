<template>
  <div class="home-container">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <!-- Create Post Box -->
        <div class="card mb-4">
          <div class="card-body">
            <textarea
              ref="createPostInput"
              v-model="postContent"
              placeholder="What's happening?"
              class="form-control mb-3"
              rows="3"
            ></textarea>
            <!-- Image Upload -->
            <div class="d-flex align-items-center mb-3">
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
            <button @click="createPost" class="btn btn-primary w-100" :disabled="!canSubmit">
              Post
            </button>
          </div>
        </div>
        <!-- Feed -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
      </div>
        <div v-else-if="filteredPosts.length === 0" class="text-center py-5">
          <p class="text-muted">No posts to display</p>
      </div>
        <div v-else class="posts-list">
        <PostCard
            v-for="post in filteredPosts"
          :key="post.id"
          :post="post"
            @post-updated="loadPosts"
        />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db, storage } from '../firebase';
import { collection, query, getDocs, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import PostCard from '../components/PostCard.vue';

export default {
  name: 'HomePage',
  components: {
    PostCard
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const posts = ref([]);
    const projects = ref([]);
    const objectives = ref([]);
    const competitions = ref([]);
    const postContent = ref('');
    const imageFile = ref(null);
    const imagePreview = ref(null);
    const currentUser = ref(null);

    const filteredPosts = computed(() => posts.value);
    const canSubmit = computed(() => {
      return postContent.value.trim() || imageFile.value;
    });
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
          content: postContent.value,
          image: imageUrl,
          authorId: auth.currentUser.uid,
          authorName: auth.currentUser.displayName,
          authorAvatar: auth.currentUser.photoURL,
          createdAt: serverTimestamp(),
          likes: [],
          comments: []
        };
        await addDoc(collection(db, 'posts'), postData);
        postContent.value = '';
        imageFile.value = null;
        imagePreview.value = null;
        await loadPosts();
      } catch (error) {
        console.error('Error creating post:', error);
      }
    };
    const loadPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(postsQuery);
        posts.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        loading.value = false;
      }
    };
    const loadProjects = async () => {
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(projectsQuery);
        projects.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };
    const loadObjectives = async () => {
      try {
        const objectivesQuery = query(
          collection(db, 'objectives'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(objectivesQuery);
        objectives.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading objectives:', error);
      }
    };
    const loadCompetitions = async () => {
      try {
        const competitionsQuery = query(
          collection(db, 'competitions'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(competitionsQuery);
        competitions.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading competitions:', error);
      }
    };
    onMounted(async () => {
      onAuthStateChanged(auth, async (user) => {
        currentUser.value = user;
        await Promise.all([
          loadPosts(),
          loadProjects(),
          loadObjectives(),
          loadCompetitions()
        ]);
      });
    });
    return {
      router,
      loading,
      posts,
      projects,
      objectives,
      competitions,
      postContent,
      imagePreview,
      filteredPosts,
      canSubmit,
      handleImageUpload,
      createPost
    };
  }
};
</script>

<style scoped>
.home-container {
  padding: 2rem 0;
  max-width: 1300px;
  margin: 0 auto;
}
.card {
  background-color: var(--dg-dark);
  border: none;
  border-radius: 0.5rem;
}
.card-title {
  color: var(--dg-white);
  font-size: 1.1rem;
  font-weight: 600;
}
.btn-group .btn {
  flex: 1;
}
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.list-group-item {
  background-color: var(--dg-dark);
  color: var(--dg-white);
  border-color: var(--dg-gray);
}
.list-group-item:hover {
  background-color: var(--dg-blue);
  color: var(--dg-white);
}
.btn-group .btn.active {
  background-color: var(--dg-blue);
  color: white;
}
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--dg-dark);
}
::-webkit-scrollbar-thumb {
  background: var(--dg-blue);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--dg-blue-dark);
}
.form-control {
  font-size: 1rem;
}
.post-content {
  font-size: 1rem;
}
</style> 