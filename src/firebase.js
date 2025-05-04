import {initializeApp} from 'firebase/app'
import {getFirestore, collection, doc, writeBatch, arrayUnion, arrayRemove, query, where, orderBy, getDocs, getDoc, setDoc, serverTimestamp, updateDoc, deleteDoc} from 'firebase/firestore'
import {getAuth} from 'firebase/auth'
import {getStorage} from 'firebase/storage'


const firebaseConfig = {
    apiKey: "AIzaSyCLA0FCC2Pj9Y8FINpBr05F-gH7xCl_laQ",
    authDomain: "devgate-project.firebaseapp.com",
    projectId: "devgate-project",
    storageBucket: "devgate-project.firebasestorage.app",
    messagingSenderId: "946114772418",
    appId: "1:946114772418:web:0f14565c053cbd642fea5b"
  };


  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app)
  export const storage = getStorage(app);

  // Collections
  export const usersCollection = collection(db, 'users');
  export const postsCollection = collection(db, 'posts');
  export const followersCollection = collection(db, 'followers');
  export const followingCollection = collection(db, 'following');

  // User functions
  export const getUserProfile = async (userId) => {
    const userDoc = await getDoc(doc(usersCollection, userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  };

  export const updateUserProfile = async (userId, data) => {
    const userRef = doc(usersCollection, userId);
    await updateDoc(userRef, data);
  };

  // Following/Followers functions
  export const followUser = async (currentUserId, targetUserId) => {
    const batch = writeBatch(db);
    
    // Add to current user's following
    const followingRef = doc(followingCollection, currentUserId);
    batch.set(followingRef, {
      following: arrayUnion(targetUserId)
    }, { merge: true });
    
    // Add to target user's followers
    const followersRef = doc(followersCollection, targetUserId);
    batch.set(followersRef, {
      followers: arrayUnion(currentUserId)
    }, { merge: true });
    
    await batch.commit();
  };

  export const unfollowUser = async (currentUserId, targetUserId) => {
    const batch = writeBatch(db);
    
    // Remove from current user's following
    const followingRef = doc(followingCollection, currentUserId);
    batch.set(followingRef, {
      following: arrayRemove(targetUserId)
    }, { merge: true });
    
    // Remove from target user's followers
    const followersRef = doc(followersCollection, targetUserId);
    batch.set(followersRef, {
      followers: arrayRemove(currentUserId)
    }, { merge: true });
    
    await batch.commit();
  };

  export const getFollowers = async (userId) => {
    const followersDoc = await getDoc(doc(followersCollection, userId));
    const followers = followersDoc.data()?.followers || [];
    
    const followersData = await Promise.all(
      followers.map(async (followerId) => {
        const userDoc = await getDoc(doc(usersCollection, followerId));
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
      })
    );
    
    return followersData.filter(Boolean);
  };

  export const getFollowing = async (userId) => {
    const followingDoc = await getDoc(doc(followingCollection, userId));
    const following = followingDoc.data()?.following || [];
    
    const followingData = await Promise.all(
      following.map(async (followingId) => {
        const userDoc = await getDoc(doc(usersCollection, followingId));
        return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
      })
    );
    
    return followingData.filter(Boolean);
  };

  // Post functions
  export const createPost = async (postData) => {
    const postRef = doc(postsCollection);
    await setDoc(postRef, {
      ...postData,
      createdAt: serverTimestamp(),
      likes: [],
      comments: []
    });
    return postRef.id;
  };

  export const deletePost = async (postId) => {
    await deleteDoc(doc(postsCollection, postId));
  };

  export const likePost = async (postId, userId) => {
    const postRef = doc(postsCollection, postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId)
    });
  };

  export const unlikePost = async (postId, userId) => {
    const postRef = doc(postsCollection, postId);
    await updateDoc(postRef, {
      likes: arrayRemove(userId)
    });
  };

  export const addComment = async (postId, comment) => {
    const postRef = doc(postsCollection, postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        ...comment,
        createdAt: serverTimestamp()
      })
    });
  };

  export const getFeedPosts = async (userId) => {
    // Get user's following list
    const followingDoc = await getDoc(doc(followingCollection, userId));
    const following = followingDoc.data()?.following || [];
    
    // Get posts from user and following
    const postsQuery = query(
      postsCollection,
      where('authorId', 'in', [...following, userId]),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  export const getUserPosts = async (userId) => {
    const postsQuery = query(
      postsCollection,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  // Project, Objective, and Competition functions
  export const createProject = async (projectData) => {
    const projectRef = doc(collection(db, 'projects'));
    await setDoc(projectRef, {
      ...projectData,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid
    });
    return projectRef.id;
  };

  export const createObjective = async (objectiveData) => {
    const objectiveRef = doc(collection(db, 'objectives'));
    await setDoc(objectiveRef, {
      ...objectiveData,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid
    });
    return objectiveRef.id;
  };

  export const createCompetition = async (competitionData) => {
    const competitionRef = doc(collection(db, 'competitions'));
    await setDoc(competitionRef, {
      ...competitionData,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid
    });
    return competitionRef.id;
  };

  export const getProjects = async () => {
    const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(projectsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  export const getObjectives = async () => {
    const objectivesQuery = query(collection(db, 'objectives'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(objectivesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  export const getCompetitions = async () => {
    const competitionsQuery = query(collection(db, 'competitions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(competitionsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  export async function upsertUserProfile(user) {
    if (!user || !user.uid) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || '',
      avatar: user.photoURL || '',
      bio: user.bio || '',
      email: user.email || ''
    }, { merge: true });
  }