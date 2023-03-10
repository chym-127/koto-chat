<script setup lang="ts">
import { ref } from 'vue';
import { initSocket } from './libs/socketHelper';
import Login from './components/login/index.vue';
import { socket, UserMessage, Message } from '@libs/socketHelper';
import { useUserStore } from '@store/index';

const userStore = useUserStore();

let isLogin = localStorage.getItem('TOKEN') ? ref(true) : ref(false);

if (isLogin.value) {
  initSocket(listenAuth);
}

const loginBoxVisible = ref(true);

function loginSuccess() {
  initSocket(listenAuth);
  loginBoxVisible.value = false;
  setTimeout(() => {
    isLogin.value = true;
  }, 1000);
}


function listenAuth() {
  socket.on('logout',()=>{
    userStore.logout()
  })
}

</script>

<template>
  <div class="w-screen h-screen overflow-hidden min-w-[1024px]">
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
