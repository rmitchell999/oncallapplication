import OnCallApplication from '@/components/OnCallApplication.vue';
import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/LoginPage.vue';
import { Auth } from 'aws-amplify'; // Ensure this is correctly imported

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  // Add other routes here
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Example usage of Auth to protect routes
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth) {
    Auth.currentAuthenticatedUser()
      .then(() => {
        next();
      })
      .catch(() => {
        next({ path: '/login' });
      });
  } else {
    next();
  }
});

export default router;