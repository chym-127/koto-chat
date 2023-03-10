<template>
  <div class="w-screen h-screen flex overflow-hidden">
    <div class="flex-1 h-full bg-blue-500 left" :class="props.visible ? 'show' : 'hide'"></div>
    <div class="flex-1 h-full bg-white right" :class="props.visible ? 'show' : 'hide'">
      <div class="login-form mt-[300px]">
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
        <div class="flex justify-center mb-1">
          <div class="w-[300px] text-right cursor-pointer">
            <span class="text-sm text-blue-500" @click="switchType">{{ isLoginType ? '注册' : '登录' }}</span>
          </div>
        </div>
        <div class="flex justify-center">
          <button
            class="w-[300px] p-2 bg-blue-500 text-white rounded login-btn"
            @click="isLoginType ? handleLogin() : handleRegister()"
          >
            <span>{{ isLoginType ? 'Login' : 'Register' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { login, register } from '../../request/api';
import { Res } from '../../request/type';
import { useUserStore } from '@store/index';

const userStore = useUserStore();
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

const isLoginType = ref(true);

function handleLogin() {
  login(user).then((resp: Res) => {
    if (resp.code === 0 && resp.data.token) {
      localStorage.setItem('TOKEN', resp.data.token);
      localStorage.setItem('USER_INFO', JSON.stringify(resp.data.userInfo));
      userStore.login(resp.data.userInfo);
      emit('success');
    } else {
      alert(resp.details);
    }
  });
}

function handleRegister() {
  register(user).then((resp: Res) => {
    if (resp.code === 0) {
      alert('注册成功');
    } else {
      alert(resp.details);
    }
  });
}

function switchType() {
  isLoginType.value = !isLoginType.value;
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

.login-btn {
  transition: transform 2s;
  transform: rotateX(0deg);
}
.login-btn.reverse {
  transform: rotateX(180deg);
}
</style>
