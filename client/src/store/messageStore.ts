import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { Message } from '@libs/socketHelper';
import { useLocalStorage, MaybeComputedRef } from '@vueuse/core';
const useMessageStore = defineStore('user_messages', () => {
  //登录状态
  const messageMapper = useLocalStorage<any>('MESSAGES', {}, { mergeDefaults: true });

  //login
  function addMsg(userId: number, msg: Message) {
    if (messageMapper.value[userId]) {
      messageMapper.value[userId] = [];
    }
    console.log(messageMapper.value);
    messageMapper.value[userId].push(msg);
  }

  return { messageMapper, addMsg };
});

export default useMessageStore;
