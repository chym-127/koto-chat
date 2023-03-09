<script setup lang="ts">
import { ref } from 'vue';
import { initSocket } from './libs/socketHelper';
import Login from './components/login/index.vue';

let isLogin = localStorage.getItem('TOKEN') ? ref(true) : ref(false);
if (isLogin) {
  initSocket();
}

const loginBoxVisible = ref(true);

function loginSuccess() {
  initSocket();
  loginBoxVisible.value = false;
  setTimeout(() => {
    isLogin.value = true;
  }, 1000);
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
    <div class="w-full h-full" v-if="isLogin || !loginBoxVisible">
      <RouterView></RouterView>
    </div>
  </div>
</template>
