import "./assets/main.css";
import { createApp } from 'vue';
import App from './App.vue';
import Amplify from 'aws-amplify';
import router from './router';

// Create the Vue app and use the router
createApp(App).use(router).mount("#app");