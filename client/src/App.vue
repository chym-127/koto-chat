<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { initSocket } from './libs/socketHelper';
import Home from './components/home/index.vue';
import Login from './components/login/index.vue';

let isLogin = localStorage.getItem('TOKEN') ? ref(true) : ref(false);
if (isLogin) {
  initSocket();
}

const loginBoxVisible = ref(true);
const chatRef = ref<InstanceType<typeof Home> | null>(null);

function loginSuccess() {
  initSocket();
  // chatRef.value?.handleListUser();
  loginBoxVisible.value = false;
}
</script>

<template>
  <div class="w-screen h-screen overflow-hidden">
    <Login
      class="z-10 absolute top-0 left-0"
      v-if="!isLogin"
      @success="loginSuccess"
      :visible="loginBoxVisible"
    ></Login>
    <Home v-if="isLogin || !loginBoxVisible" class="absolute top-0 left-0" ref="chatRef"></Home>
  </div>
</template>
