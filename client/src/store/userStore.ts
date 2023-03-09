import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
const useUserStore = defineStore('user_store', () => {
  //登录状态
  const isLogin = useLocalStorage('IS_LOGIN', false); // true or false
  let userInfo = reactive<any>({}); // 当前登录的用户信息

  //login
  function login(user: any) {
    isLogin.value = true;
    userInfo = reactive<any>(user);
  }

  return { isLogin, userInfo, login };
});

export default useUserStore;
