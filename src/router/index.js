import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import signup from '../components/signUp.vue'
import login from '../components/Login.vue'
import project from '../components/projects.vue'
import GestComp from '../components/GestComp.vue'
import UserTimeline from '../components/Timeline.vue'
import UserObjectives from '../components/Objectives.vue'
import ProfileView from '../components/Dashbord.vue'
import UserProfile from '../components/UserProfile.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/signUp',
    name:'signup',
    component: signup
  },
  {
    path:'/Login',
    name: 'login',
    component: login
  }, 
  {
    path:'/AddProject',
    name:'addproject',
    component: project
  }, 
  {
    path:'/GestComp',
    name:'GestComp',
    component: GestComp
  },
  {
    path: '/timeline',
    name: 'timeline',
    component: UserTimeline
  },
  {
    path: '/objectives',
    name: 'objectives',
    component: UserObjectives
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: ProfileView
  },
  {
    path: '/profile/:userId',
    name: 'UserProfile',
    component: UserProfile,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/', '/Login', '/signUp'];
  const authRequired = !publicPages.includes(to.path);
  const user = localStorage.getItem('user');
  if (authRequired && !user) {
    return next('/Login');
  }
  next();
});

export default router
