import { defineStore } from 'pinia';
import { Message } from '@libs/socketHelper';
import useLocalStore from './useLocalStore';
const useMessageStore = defineStore('user_messages', () => {
  const messageMapper = useLocalStore<{ [key: number]: Message[] }>('MESSAGES', {});

  function addMsg(userId: number, msg: Message) {
    if (!messageMapper[userId]) {
      messageMapper[userId] = [];
    }
    messageMapper[userId].push(msg);
  }

  return { messageMapper, addMsg };
});

export default useMessageStore;
