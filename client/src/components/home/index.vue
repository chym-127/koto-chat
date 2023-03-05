<script setup lang="ts">
import { reactive, ref } from 'vue';
import VoiceChat from '../voice-chat/index.vue';
import { listUser } from '../../request/api';
import { User, UserState } from './types';
import phoneCall from '../../assets/phone-call.png';
import sendPic from '../../assets/send.png';
import { socket, UserMessage } from '../../libs/socketHelper';
let users = reactive<User[]>([]);
let activeUser = reactive<User>({
  id: 0,
  username: '',
  state: UserState.OFFLINE,
});
const activeUserIndex = ref(0);
let user = JSON.parse(localStorage.getItem('USER_INFO')!);

function handleListUser() {
  listUser().then((resp) => {
    if (resp.code === 0 && resp.data.items) {
      resp.data.items.forEach((u: any) => {
        if (user.id !== u.id) {
          users.push(u);
        }
      });

    }
  });
}

function setActiveUser(user: User, index: number) {
  activeUserIndex.value = index;
  activeUser.id = user.id;
  activeUser.username = user.username;
  activeUser.state = user.state;
}

// 监听用户列表
socket.on('on_users', (msg: UserMessage) => {
  switch (msg.type) {
    case 'add':
      users.push(msg.user);
      break;
    case 'update':
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if (user.id === msg.user.id) {
          user.state = msg.user.state;
          user.username = msg.user.username;
        }
      }
      break;

    default:
      break;
  }
});

const message = ref('');

function sendMessage() {
  console.log(message.value);
  message.value = '';
}

// 发起呼叫请求
function handleRequestCall() {
  chatRef.value!.call(activeUser.id)
}


let senderId = ref(user.id);
const chatRef = ref<InstanceType<typeof VoiceChat> | null>(null);

handleListUser();
</script>

<template>
  <div class="w-screen h-screen p-4 bg-[#f0f0f0] flex flex-col">
    <VoiceChat ref="chatRef" :sender-id="senderId" :receiver-id="activeUser.id"></VoiceChat>
    <div class="body flex flex-1">
      <div class="user-list w-[300px] flex flex-col">
        <!-- <div class="search-bar h-[55px] bg-[#fff] mb-4 rounded-xl"></div> -->
        <div class="users-box cursor-pointer flex-1 bg-[#fff] p-2 rounded-xl">
          <div class="user border relative border-black-600 h-[40px] mb-2 flex items-center rounded"
            v-for="(user, index) in users" @click="setActiveUser(user, index)" :key="index"
            :class="activeUserIndex === index ? 'bg-blue-500' : ''">
            <div class="pic w-[30px] relative h-[30px] rounded-full bg-slate-300 m-2">
              <div class="state absolute w-2 h-2 bottom-[1px] right-[4px] rounded-full"
                :class="user.state === UserState.OFFLINE ? 'bg-red-500' : 'bg-green-500'"></div>
            </div>
            <div class="info flex h-full flex-1 flex items-center"
              :class="activeUserIndex === index ? 'text-white' : 'text-black'">
              <p class="text-lg font-semibold">{{ user.username }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-box flex-1 ml-4 bg-[#fff] rounded-xl flex flex-col">
        <div class="header h-[50px] border-b px-4 flex justify-between items-center">
          <div class="h-full flex items-center">
            <span class="text-lg font-semibold">{{ activeUser.username }}</span>
          </div>
          <div class="cursor-pointer" @click="handleRequestCall">
            <img :src="phoneCall" class="w-6 h-6" alt="" srcset="" />
          </div>
        </div>
        <div class="message-box flex-1 p-4">
          <div class="message-item mb-2"></div>
        </div>
        <div class="footer h-[60px] px-4 pb-4">
          <div class="send-box border h-full relative p-2 flex items-center">
            <input v-model="message" type="text" class="w-full h-full p-1 flex-1" @keyup.enter="sendMessage"
              placeholder="输入消息按Enter发送" />
            <img class="w-6 h-6 cursor-pointer" :src="sendPic" alt="" srcset="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
input {
  outline: none;
}

input:focus {
  outline: none;
}
</style>
