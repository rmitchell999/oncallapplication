import "./assets/main.css";
import { createApp } from 'vue';
import App from './App.vue';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import router from './router';

// Configure Amplify with the correct exports
Amplify.configure(aws_exports);

// Create the Vue app and use the router
createApp(App).use(router).mount("#app");