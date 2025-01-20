import { createRouter, createWebHistory } from 'vue-router';
import OnCallApplication from '@/components/OnCallApplication.vue';
import LoginPage from '@/components/LoginPage.vue';
import { Auth } from 'aws-amplify';

const routes = [
  { path: '/', component: OnCallApplication },
  { path: '/login', component: LoginPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to protect routes
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = await Auth.currentAuthenticatedUser()
    .then(() => true)
    .catch(() => false);

  if (to.path !== '/login' && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;