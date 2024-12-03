<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100"
  >
    <h1 class="text-2xl font-semibold mb-6">Sign Up</h1>

    <form
      @submit.prevent="handleSubmit"
      class="w-full max-w-xs p-6 bg-white rounded-lg shadow-md"
    >
      <div class="mb-4">
        <label for="username" class="block text-gray-700">Username</label>
        <input
          type="username"
          v-model="username"
          required
          class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700">Password</label>
        <input
          type="password"
          v-model="password"
          required
          class="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        class="w-full py-2 mb-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Sign Up
      </button>
    </form>

    <div class="flex flex-col items-center justify-center space-y-2">
      <p class="mt-4">Already have an account?</p>
      <p
        class="mt-4 text-blue-500 cursor-pointer hover:text-blue-800"
        :onclick="redirectToLogin"
      >
        Login
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import axios from "axios";
import router from "../router";

const username = ref<string>("");
const password = ref<string>("");

const redirectToLogin = () => {
  router.push("/");
};

const handleSubmit = async () => {
  const endpoint = "http://localhost:3000/api/auth/signup";
  const payload = { username: username.value, password: password.value };

  console.log(payload);

  try {
    const response = await axios.post(endpoint, payload, {
      withCredentials: true,
    });
    if (response.data.success) {
      //redirect
      alert(`Sign Up Successful!`);
      redirectToLogin();
    } else {
      alert(`Error: ${response.data.message}`);
    }
  } catch (error) {
    console.error(error);
    alert("An error occurred. Please try again.");
  }
};
</script>
