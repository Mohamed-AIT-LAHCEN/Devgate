<template>
  <div class="card mb-3 post-card">
    <div class="card-body d-flex">
      <img :src="post.authorAvatar" class="rounded-circle me-3 post-avatar" style="width:48px;height:48px;cursor:pointer" @click="goToProfile(post.authorId)" />
      <div class="flex-grow-1">
        <div class="d-flex align-items-center mb-1">
          <span class="fw-bold post-author" style="cursor:pointer" @click="goToProfile(post.authorId)">
            {{ post.authorName }}
          </span>
          <span class="text-muted ms-2" style="font-size:0.9em">{{ formatDate(post.createdAt) }}</span>
          <button v-if="canDelete" @click="showDeleteModal = true" class="btn btn-link btn-sm text-danger ms-auto" title="Delete post">
            Delete
          </button>
        </div>
        <div class="mb-2 post-content">{{ post.content }}</div>
        <div class="mb-2">
          <span v-if="post.project" class="badge bg-info me-2">Projet: {{ post.project.title }}</span>
          <span v-if="post.objective" class="badge bg-success me-2">Objectif: {{ post.objective.title }}</span>
          <span v-if="post.competition" class="badge bg-warning text-dark">Compétition: {{ post.competition.title }}</span>
        </div>
        <img v-if="post.image" :src="post.image" class="img-fluid rounded mt-2" style="max-width:300px" />
        <div class="d-flex gap-3 border-top pt-3 mt-3">
          <button @click="toggleLike"
            :class="['btn', isLiked ? 'btn-secondary' : 'btn-outline-danger', 'btn-sm', 'd-flex', 'align-items-center']">
            <i class="fas fa-heart me-1"></i>
            <span>{{ isLiked ? 'Liked' : 'Like' }}</span>
          </button>
          <button @click="toggleComments"
            class="btn btn-outline-primary btn-sm d-flex align-items-center">
            <i class="fas fa-comment me-1"></i>
            Comment
          </button>
        </div>
        <div class="d-flex gap-4 mt-2 small text-muted likes-comments-count">
          <span><i class="fas fa-heart me-1"></i>{{ (post.likes && post.likes.length) ? post.likes.length : 0 }} likes</span>
          <span><i class="fas fa-comment me-1"></i>{{ (post.comments && post.comments.length) ? post.comments.length : 0 }} comments</span>
        </div>
        <div v-if="showComments" class="mt-3 border-top pt-3">
          <div v-for="comment in post.comments" :key="comment.id" class="d-flex mb-3">
            <img :src="comment.authorAvatar" alt="Commenter" class="rounded-circle me-2" style="width: 32px; height: 32px;" />
            <div class="flex-grow-1">
              <h6 class="mb-1">{{ comment.authorName }}</h6>
              <p class="mb-0">{{ comment.content }}</p>
            </div>
          </div>
          <div class="input-group">
            <input v-model="newComment" type="text" class="form-control" placeholder="Add a comment..." />
            <button @click="addComment" class="btn btn-primary">Post</button>
          </div>
        </div>
        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-backdrop">
          <div class="modal-dialog-centered modal-confirm">
            <div class="modal-content bg-dark text-white p-4 rounded">
              <h5 class="mb-3">Delete Post</h5>
              <p>Are you sure you want to delete this post?</p>
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
                <button class="btn btn-danger" @click="confirmDelete">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  emits: ['post-updated'],
  setup(props, { emit }) {
    const showComments = ref(false);
    const newComment = ref('');
    const showDeleteModal = ref(false);
    const router = useRouter();

    const isLiked = computed(() => {
      return props.post.likes && auth.currentUser
        ? props.post.likes.includes(auth.currentUser.uid)
        : false;
    });

    const canDelete = computed(() => {
      return auth.currentUser && props.post.authorId === auth.currentUser.uid;
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const goToProfile = (userId) => {
      router.push(`/profile/${userId}`);
    };

    const toggleLike = async () => {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }
      const postRef = doc(db, 'posts', props.post.id);
      if (isLiked.value) {
        await updateDoc(postRef, {
          likes: arrayRemove(auth.currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(auth.currentUser.uid)
        });
      }
      emit('post-updated');
    };

    const toggleComments = () => {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }
      showComments.value = !showComments.value;
    };

    const addComment = async () => {
      if (!newComment.value.trim() || !auth.currentUser) return;
      const postRef = doc(db, 'posts', props.post.id);
      await updateDoc(postRef, {
        comments: arrayUnion({
          id: Date.now(),
          content: newComment.value,
          authorId: auth.currentUser.uid,
          authorName: auth.currentUser.displayName,
          authorAvatar: auth.currentUser.photoURL,
          createdAt: new Date()
        })
      });
      newComment.value = '';
      emit('post-updated');
    };

    const confirmDelete = async () => {
      if (!auth.currentUser || props.post.authorId !== auth.currentUser.uid) return;
      try {
        await deleteDoc(doc(db, 'posts', props.post.id));
        showDeleteModal.value = false;
        emit('post-updated');
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    };

    return {
      showComments,
      newComment,
      isLiked,
      canDelete,
      formatDate,
      goToProfile,
      toggleLike,
      toggleComments,
      addComment,
      showDeleteModal,
      confirmDelete
    };
  }
};
</script>

<style scoped>
.post-card {
  background: #181818 !important;
  color: var(--dg-white) !important;
  border: none;
  width: 100%;
}
.post-card:hover {
  /* Remove any transform, scale, or box-shadow to prevent size change */
  background: #181818 !important;
  box-shadow: none !important;
  transform: none !important;
}
.post-avatar {
  border: 2px solid var(--dg-blue);
}
.post-author:hover {
  color: var(--dg-blue);
  text-decoration: underline;
}
.text-muted {
  color: #b0c4ff !important;
}
.post-content {
  font-size: 1rem;
}
.btn-link .fa-heart, .btn-link .fa-comment {
  color: #fff !important;
}
.btn-link.text-danger .fa-heart {
  color: #ff6b6b !important;
}
.btn-link.text-danger .fa-trash {
  color: #ff6b6b !important;
}
/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-dialog-centered {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.modal-confirm {
  min-width: 320px;
  max-width: 90vw;
}
.likes-comments-count {
  font-size: 0.95em;
  color: #b0c4ff;
  margin-bottom: 0.5rem;
}
::placeholder {
  color: #b0c4ff !important;
  opacity: 1;
}
input::placeholder, textarea::placeholder {
  color: #b0c4ff !important;
  opacity: 1;
}
</style> 