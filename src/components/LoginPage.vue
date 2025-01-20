<!-- src/components/LoginPage.vue -->
<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="signIn">
        <label>Email</label>
        <input v-model="email" type="email" required />
        <label>Password</label>
        <input v-model="password" type="password" required />
        <button type="submit">Login</button>
      </form>
      <p>{{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { Auth } from 'aws-amplify';
  
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  
  const signIn = async () => {
    try {
      await Auth.signIn(email.value, password.value);
      window.location.href = '/';
    } catch (error) {
      errorMessage.value = error.message;
    }
  };
  </script>