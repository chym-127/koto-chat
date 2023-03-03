<template>
  <div class="w-screen h-screen flex overflow-hidden">
    <div class="flex-1 h-full bg-blue-500 left" :class="props.visible ? 'show' : 'hide'"></div>
    <div class="flex-1 h-full bg-white right" :class="props.visible ? 'show' : 'hide'">
      <div class="login-form mt-[200px]">
        <div class="username flex justify-center mb-4">
          <input
            v-model="user.username"
            class="w-[300px]"
            type="text"
            @keyup.enter="handleLogin"
            placeholder="Username"
          />
        </div>
        <div class="password flex justify-center mb-4">
          <input
            v-model="user.password"
            class="w-[300px]"
            type="password"
            @keyup.enter="handleLogin"
            placeholder="Password"
            id=""
          />
        </div>
        <div class="flex justify-center">
          <button class="w-[300px] p-2 bg-blue-500 text-white rounded" @click="handleLogin">Login</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { login } from '../../request/api';
import { Res } from '../../request/type';

const props = defineProps({
  visible: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const user = reactive({
  username: 'tom',
  password: '123123',
});

function handleLogin() {
  login(user).then((resp: Res) => {
    if (resp.code === 0 && resp.data.token) {
      localStorage.setItem('TOKEN', resp.data.token);
      localStorage.setItem('USER_INFO', JSON.stringify(resp.data.userInfo));

      emit('success');
    }
  });
}
</script>

<style lang="less" scoped>
input {
  outline: none;
  padding: 8px;
  border: 1px solid #f0f0f0;
}

input:focus {
  outline: none;
}

.left,
.right {
  transition: transform 1s;
}

.left.show {
  transform: translateX(0);
}

.left.hide {
  transform: translateX(-100%);
}

.right.hide {
  transform: translateX(100%);
}

.right.show {
  transform: translateX(0);
}
</style>
