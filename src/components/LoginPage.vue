<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  mport { Auth } from '@aws-amplify/auth'; // Ensure this import
  
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  
  const login = async () => {
    try {
      await Auth.signIn(email.value, password.value);
      // Handle successful login
    } catch (error) {
      // Handle error
      if (error instanceof Error) {
        errorMessage.value = error.message;
      } else {
        errorMessage.value = String(error);
      }
    }
  };
  </script>