<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="user">
      <div class="container py-4">
        <div class="row">
          <div class="col-md-4">
            <div class="card mb-4">
              <div class="card-body text-center">
                <img :src="user.avatar" alt="Profile" class="rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover;" />
                <h3 class="card-title">{{ user.name }}</h3>
                <p class="text-muted">{{ user.bio }}</p>
                <div class="d-flex justify-content-center gap-2 mb-3">
                  <button v-if="!isCurrentUser" @click="toggleFollow" class="btn" :class="isFollowing() ? 'btn-outline-secondary' : 'btn-primary'">
                    {{ isFollowing() ? 'Unfollow' : 'Follow' }}
                  </button>
                  <button class="btn btn-outline-primary">
                    <i class="fas fa-envelope"></i> Message
                  </button>
                </div>
                <div class="d-flex justify-content-around">
                  <div class="text-center">
                    <h5 class="mb-0">{{ followers ? followers.length : 0 }}</h5>
                    <small class="text-muted">Followers</small>
                  </div>
                  <div class="text-center">
                    <h5 class="mb-0">{{ following ? following.length : 0 }}</h5>
                    <small class="text-muted">Following</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card">
              <div class="card-body">
                <ul class="nav nav-tabs mb-3">
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'" href="#">
                      Posts
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'followers' }" @click="activeTab = 'followers'" href="#">
                      Followers ({{ followers ? followers.length : 0 }})
                    </a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" :class="{ active: activeTab === 'following' }" @click="activeTab = 'following'" href="#">
                      Following ({{ following ? following.length : 0 }})
                    </a>
                  </li>
                </ul>
                <template v-if="activeTab === 'posts'">
                  <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <div v-else-if="userPosts.length === 0" class="text-center py-4">
                    <p class="text-muted">No posts yet</p>
                  </div>
                  <PostCard v-else v-for="post in userPosts" :key="post.id" :post="post" />
                </template>
                <template v-else-if="activeTab === 'followers'">
                  <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <div v-else-if="followers && followers.length === 0" class="text-center py-4">
                    <p class="text-muted">No followers yet</p>
                  </div>
                  <div v-else class="list-group">
                    <div v-for="follower in followers" :key="follower.id" class="list-group-item d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center">
                        <img :src="follower.avatar" alt="Follower" class="rounded-circle me-3" style="width: 40px; height: 40px;" />
                        <div>
                          <h6 class="mb-0">{{ follower.name }}</h6>
                          <small class="text-muted">{{ follower.bio }}</small>
                        </div>
                      </div>
                      <button v-if="auth.currentUser && follower.id !== auth.currentUser.uid" @click="toggleFollowUser(follower)" class="btn btn-sm" :class="isFollowingUser(follower) ? 'btn-outline-secondary' : 'btn-primary'">
                        {{ isFollowingUser(follower) ? 'Unfollow' : 'Follow' }}
                      </button>
                    </div>
                  </div>
                </template>
                <template v-else-if="activeTab === 'following'">
                  <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  <div v-else-if="following && following.length === 0" class="text-center py-4">
                    <p class="text-muted">Not following anyone yet</p>
                  </div>
                  <div v-else class="list-group">
                    <div v-for="followed in following" :key="followed.id" class="list-group-item d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center">
                        <img :src="followed.avatar" alt="Following" class="rounded-circle me-3" style="width: 40px; height: 40px;" />
                        <div>
                          <h6 class="mb-0">{{ followed.name }}</h6>
                          <small class="text-muted">{{ followed.bio }}</small>
                        </div>
                      </div>
                      <button v-if="auth.currentUser && followed.id !== auth.currentUser.uid" @click="toggleFollowUser(followed)" class="btn btn-sm" :class="isFollowingUser(followed) ? 'btn-outline-secondary' : 'btn-primary'">
                        {{ isFollowingUser(followed) ? 'Unfollow' : 'Follow' }}
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-danger py-5">
      User not found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db, auth, followUser, unfollowUser, getFollowers, getFollowing, getUserPosts } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import PostCard from './PostCard.vue';

const route = useRoute();
const user = ref(null);
const loading = ref(true);
const followers = ref([]);
const following = ref([]);
const userPosts = ref([]);
const activeTab = ref('posts');

const isCurrentUser = computed(() => auth.currentUser && user.value && auth.currentUser.uid === user.value.uid);
const isFollowing = () => followers.value.some(f => f.id === auth.currentUser?.uid);

const isFollowingUser = (targetUser) => {
  return following.value.some(f => f.id === targetUser.id);
};

const toggleFollow = async () => {
  if (!auth.currentUser || !user.value) return;
  try {
    if (isFollowing()) {
      await unfollowUser(auth.currentUser.uid, user.value.uid);
    } else {
      await followUser(auth.currentUser.uid, user.value.uid);
    }
    await loadFollowers();
    await loadFollowing();
  } catch (error) {
    console.error('Error toggling follow:', error);
  }
};

const toggleFollowUser = async (targetUser) => {
  if (!auth.currentUser || !targetUser) return;
  try {
    if (isFollowingUser(targetUser)) {
      await unfollowUser(auth.currentUser.uid, targetUser.id);
    } else {
      await followUser(auth.currentUser.uid, targetUser.id);
    }
    await loadFollowers();
    await loadFollowing();
  } catch (error) {
    console.error('Error toggling follow:', error);
  }
};

const loadFollowers = async () => {
  if (!user.value) return;
  try {
    followers.value = await getFollowers(user.value.uid);
  } catch (error) {
    console.error('Error loading followers:', error);
  }
};

const loadFollowing = async () => {
  if (!user.value) return;
  try {
    following.value = await getFollowing(user.value.uid);
  } catch (error) {
    console.error('Error loading following:', error);
  }
};

const loadUserPosts = async () => {
  if (!user.value) return;
  try {
    loading.value = true;
    userPosts.value = await getUserPosts(user.value.uid);
  } catch (error) {
    console.error('Error loading user posts:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  const userId = route.params.id;
  console.log('Querying userId for profile:', userId);
  if (userId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      user.value = { id: userDoc.id, ...userDoc.data() };
      await Promise.all([
        loadFollowers(),
        loadFollowing(),
        loadUserPosts()
      ]);
    }
  }
  loading.value = false;
});
</script>

<style scoped>
.nav-tabs .nav-link {
  color: var(--dg-white);
  border: none;
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border-radius: 0.25rem;
}

.nav-tabs .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-tabs .nav-link.active {
  background-color: var(--dg-blue);
  color: white;
}

.list-group-item {
  background-color: transparent;
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--dg-white);
}

.list-group-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.btn-outline-secondary {
  color: var(--dg-white);
  border-color: var(--dg-white);
}

.btn-outline-secondary:hover {
  background-color: var(--dg-white);
  color: var(--dg-dark);
}

.btn-primary {
  background-color: var(--dg-blue);
  border-color: var(--dg-blue);
}

.btn-primary:hover {
  background-color: var(--dg-blue-dark);
  border-color: var(--dg-blue-dark);
}
</style> 