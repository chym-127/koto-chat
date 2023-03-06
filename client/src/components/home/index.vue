<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
import VoiceChat from '../voice-chat/index.vue';
import { listUser } from '../../request/api';
import { RecentMsg, User, UserState } from './types';
import phoneCall from '../../assets/phone-call.png';
import sendPic from '../../assets/send.png';
import { getAvatarByUserId } from '../../libs/avatar';
import { socket, UserMessage, Message } from '../../libs/socketHelper';
let users = reactive<User[]>([]);
let activeUser = reactive<User>({
  id: 0,
  username: '',
  state: UserState.OFFLINE,
});
const activeUserIndex = ref(-1);
let user = JSON.parse(localStorage.getItem('USER_INFO')!);

const msgMapper = reactive<{ [key: number]: Message[] }>({});
const recentMapper = reactive<{ [key: number]: RecentMsg }>({});

function handleListUser() {
  listUser().then((resp) => {
    if (resp.code === 0 && resp.data.items) {
      resp.data.items.forEach((u: any) => {
        if (user.id !== u.id) {
          users.push(u);
          msgMapper[+u.id] = [];
          recentMapper[+u.id] = {
            content: '',
            newMsgCount: 0,
            isTyping: false,
          };
        }
      });
    }
  });
}

function setActiveUser(user: User, index: number) {
  recentMapper[user.id].newMsgCount = 0;
  activeUserIndex.value = index;
  activeUser.id = user.id;
  activeUser.username = user.username;
  activeUser.state = user.state;
  nextTick(() => {
    msgContainer.value?.scrollTo(0, msgContainer.value?.scrollHeight);
  });
}

// 监听用户列表
socket.on('on_users', (msg: UserMessage) => {
  switch (msg.type) {
    case 'add':
      users.push(msg.user);
      recentMapper[+user.id] = {
        content: '',
        newMsgCount: 0,
        isTyping: false,
      };
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
  let msg = {
    senderId: user.id,
    receiverId: activeUser.id,
    content: message.value,
    sendTime: +new Date(),
  };
  socket.emit('send_msg', msg);
  msgMapper[activeUser.id].push(msg);
  recentMapper[activeUser.id].content = msg.content;

  message.value = '';
  nextTick(() => {
    msgContainer.value?.scrollTo(0, msgContainer.value?.scrollHeight);
  });
}

socket.on('receive_msg', (msg) => {
  msgMapper[msg.senderId].push(msg);
  recentMapper[msg.senderId].content = msg.content;
  if (msg.senderId === activeUser.id) {
    nextTick(() => {
      msgContainer.value?.scrollTo(0, msgContainer.value?.scrollHeight);
    });
  } else {
    recentMapper[msg.senderId].newMsgCount++;
  }
});

// 发起呼叫请求
function handleRequestCall() {
  chatRef.value!.call(activeUser);
}

function logout() {
  localStorage.clear();
  location.reload();
}

let senderId = ref(user.id);
const chatRef = ref<InstanceType<typeof VoiceChat> | null>(null);
const msgContainer = ref<InstanceType<typeof HTMLDivElement> | null>(null);

handleListUser();
</script>

<template>
  <div class="w-screen h-screen p-4 bg-[#f0f0f0] flex flex-col relative">
    <VoiceChat ref="chatRef" class="z-50" :sender-id="senderId"></VoiceChat>
    <div class="flex flex-1 h-0 rounded">
      <div class="user-list bg-[#fff] w-[300px] flex flex-col rounded-xl">
        <div class="text-center py-4 border-b">
          <span class="text-lg font-semibold">
            {{ user.username }}
          </span>
        </div>
        <!-- <div class="p-2">
          <span class="text-base font-semibold"># MESSAGE</span>
        </div> -->
        <div class="users-box flex-1">
          <div
            class="user relative cursor-pointer border-black-600 h-[50px] mb-2 flex items-center justify-between rounded"
            v-for="(user, index) in users"
            @click="setActiveUser(user, index)"
            :key="index"
            :class="activeUserIndex === index ? 'bg-[#f6f7fb]' : ''"
          >
            <div class="pic w-[40px] ml-2 relative h-[40px] rounded-full bg-slate-300">
              <div
                class="state absolute w-2 h-2 bottom-[1px] right-[4px] rounded-full"
                :class="user.state === UserState.OFFLINE ? 'bg-red-500' : 'bg-green-500'"
              ></div>
              <img :src="getAvatarByUserId(user.id % 20)" class="w-[40px] h-[40px] rounded-full" alt="" srcset="" />
            </div>
            <div
              class="info flex h-full w-0 flex-1 flex items-start border-b text-black ml-[12px]"
              :class="activeUserIndex === index ? 'text-black' : 'text-black'"
            >
              <div class="flex flex-1 max-w-full flex-col">
                <span class="text font-medium mt-1">{{ user.username }}</span>
                <div class="text-xs text-[#cfcfcf] text-ellipsis whitespace-nowrap">
                  {{ recentMapper[user.id] ? recentMapper[user.id].content : '' }}
                </div>
              </div>
              <div class="w-[40px] h-full flex items-center justify-center">
                <div
                  class="bg-[#ebaa89] rounded-full h-4 w-4 flex justify-center text-center"
                  v-show="recentMapper[user.id].newMsgCount"
                >
                  <span class="text-white text-xs">{{ recentMapper[user.id].newMsgCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="setting p-4">
          <!-- <div>
            <span class="text-base font-semibold"># SETTING</span>
          </div> -->
          <div>
            <button class="w-[100%] p-2 bg-blue-500 text-white rounded" @click="logout">Logout</button>
          </div>
        </div>
      </div>
      <div class="chat-box flex-1 ml-4 bg-[#fff] rounded-xl flex flex-col">
        <div class="header h-[50px] border-b px-4 flex justify-between items-center">
          <div class="h-full flex items-center">
            <span class="text-lg font-semibold">{{ activeUser.username }}</span>
          </div>
          <div class="cursor-pointer" @click="handleRequestCall" v-show="activeUser.id">
            <img :src="phoneCall" class="w-6 h-6" alt="" srcset="" />
          </div>
        </div>
        <div class="message-box flex-1 f-0 p-4 overflow-hidden">
          <div class="h-full w-full overflow-y-auto p-2 mr-[10px]" ref="msgContainer" v-if="activeUser.id">
            <div
              class="message-item mb-2 flex flex-col"
              :class="msg.senderId === activeUser.id ? 'items-start' : 'items-end'"
              v-for="(msg, index) in msgMapper[activeUser.id]"
              :key="index"
            >
              <div class="msg-own">{{ msg.senderId === activeUser.id ? activeUser.username : user.username }}</div>
              <div
                class="msg-context rounded-b-xl bg-[#c9e5fb] px-4 py-2 min-h-[40px] max-w-[70%] whitespace-normal break-all"
                :class="msg.senderId === activeUser.id ? 'rounded-tr-xl' : 'rounded-tl-xl'"
              >
                {{ msg.content }}
              </div>
            </div>
          </div>

          <!-- <div class="message-item mb-2 flex justify-end">
            <div class="msg-own"></div>
            <div class="msg-context bg-[#c9e5fb] p-2 min-h-[40px] max-w-[70%]"></div>
          </div> -->
        </div>
        <div class="footer h-[60px] px-4 pb-4" v-show="activeUser.id">
          <div class="send-box border h-full relative p-2 flex items-center">
            <input
              v-model="message"
              type="text"
              class="w-full h-full p-1 flex-1"
              @keyup.enter="sendMessage"
              placeholder="输入消息按Enter发送"
            />
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
