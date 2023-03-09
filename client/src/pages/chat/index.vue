<script setup lang="ts">
import { reactive, ref, nextTick, computed } from 'vue';
import CallPhone from './CallPhone/index.vue';
import { listUser } from '../../request/api';
import { RecentMsg, User, UserState } from './types';
import phoneCall from '../../assets/phone-call.png';
import sendPic from '../../assets/send.png';
import { getAvatarByUserId } from '../../libs/avatar';
import { useMessageStore } from '@store/index';
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

const msgStore = useMessageStore();

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
    case 'remove':
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        if (user.id === msg.user.id) {
          users.splice(index, 1);
        }
      }
      break;
    default:
      break;
  }
});

const message = ref('');

function sendMessage() {
  if (!message.value.trim()) {
    return;
  }
  let msg = {
    senderId: user.id,
    receiverId: activeUser.id,
    content: message.value,
    sendTime: +new Date(),
  };
  socket.emit('send_msg', msg);
  msgMapper[activeUser.id].push(msg);
  msgStore.addMsg(activeUser.id, msg);
  recentMapper[activeUser.id].content = msg.content;

  message.value = '';
  nextTick(() => {
    msgContainer.value?.scrollTo(0, msgContainer.value?.scrollHeight);
  });
}

socket.on('receive_msg', (msg) => {
  msgMapper[msg.senderId].push(msg);
  msgStore.addMsg(msg.senderId, msg);
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
  callPhoneRef.value!.call(activeUser);
}

const sendInputPlaceholder = computed(() => {
  if (activeUser.state === UserState.OFFLINE) {
    return '对方不在线，无法发送消息';
  }
  return '输入消息按Enter发送';
});

let senderId = ref(user.id);
const callPhoneRef = ref<InstanceType<typeof CallPhone> | null>(null);
const msgContainer = ref<InstanceType<typeof HTMLDivElement> | null>(null);

handleListUser();
</script>

<template>
  <div class="w-full h-full bg-[#f0f0f0] flex relative">
    <CallPhone ref="callPhoneRef" class="z-50" :sender-id="senderId"></CallPhone>
    <div class="center-box w-[375px] border-r h-full bg-[#fff]">
      <div class="profile mt-[30px] w-full flex flex-col justify-center items-center">
        <div class="avatar w-[105px] h-[105px] rounded-full relative">
          <div class="state-point w-[12px] h-[12px] rounded-full top-[85px] right-[12px] absolute bg-[#27AD55]"></div>
          <img :src="getAvatarByUserId(user.id % 20)" class="w-[105px] h-[105px] rounded-full" alt="" srcset="" />
        </div>
        <div class="username mt-3">
          <span class="text-xl font-medium">
            {{ user.username }}
          </span>
        </div>
        <div class="state-bar w-[68px] h-[22px] bg-[#C3EFD2] rounded mt-2 flex justify-center items-center">
          <span class="text-xs text-[#2BB55A]">Active</span>
        </div>
      </div>

      <div class="chats-box">
        <div class="header px-4 py-2">
          <span class="text-xl font-medium">Chats</span>
        </div>
        <div
          class="chat-user px-4 py-2 h-[70px] w-full flex justify-between items-center"
          :class="activeUserIndex === index ? 'bg-[#F6F6F6]' : null"
          v-for="(u, index) in users"
          @click="setActiveUser(u, index)"
          :key="u.id"
        >
          <div class="w-[50px] h-[50px] relative rounded-full">
            <div
              class="state-point w-[8px] h-[8px] rounded-full top-[36px] right-[6px] absolute"
              :class="u.state === UserState.ONLINE ? ' bg-[#27AD55]' : ' bg-[#878B7C]'"
            ></div>
            <img :src="getAvatarByUserId(u.id % 20)" class="w-[50px] h-[50px] rounded-full" alt="" srcset="" />
          </div>
          <div class="ml-3 flex-1 w-0 h-full">
            <div class="mb-1">
              <span class="text-xl font-medium">{{ u.username }}</span>
            </div>
            <div class="text-xs text-[#A1A1A1] text-ellipsis whitespace-nowrap break-all overflow-hidden">
              {{ recentMapper[u.id] ? recentMapper[u.id].content : '' }}
            </div>
          </div>

          <div class="h-full w-[40px]">
            <div>
              <span class="text-xs text-[#A1A1A1]">20:30</span>
            </div>
            <div
              v-show="recentMapper[u.id].newMsgCount"
              class="mt-1 flex text-center w-[18px] h-[18px] justify-center items-center rounded-full bg-[#A251E1]"
            >
              <span class="text-white text-xs">
                {{ recentMapper[u.id].newMsgCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="right-box flex-1 w-0 h-full flex flex-col">
      <div class="header mt-[30px] mx-6 h-[35px] flex justify-between">
        <div>
          <span class="text-xl font-medium">{{ activeUser.username }}</span>
        </div>
        <div class="flex space-x-6">
          <div
            class="w-[35px] h-[35px] rounded-lg bg-white flex justify-center items-center"
            @click="handleRequestCall()"
          >
            <i class="iconfont icon-call"></i>
          </div>
          <div class="w-[35px] h-[35px] rounded-lg bg-white flex justify-center items-center">
            <i class="iconfont icon-menu"></i>
          </div>
        </div>
      </div>
      <div class="message-box flex-1 h-0 w-full my-6 overflow-hidden">
        <div class="h-full w-full overflow-y-auto px-4 mr-[10px]" ref="msgContainer" v-if="activeUser.id">
          <div
            class="message-item mb-3 flex"
            :class="msg.senderId === activeUser.id ? 'items-start' : 'items-end flex-row-reverse'"
            v-for="(msg, index) in msgMapper[activeUser.id]"
            :key="index"
          >
            <div class="send-avatar w-[40px] h-[40px] rounded-full">
              <img :src="getAvatarByUserId(msg.senderId)" class="w-[40px] h-[40px] rounded-full" alt="" srcset="" />
            </div>

            <!-- <div class="msg-own">{{ msg.senderId === activeUser.id ? activeUser.username : user.username }}</div> -->
            <div
              class="msg-context rounded-t-xl bg-[#c9e5fb] px-4 py-2 min-h-[40px] max-w-[70%] whitespace-normal break-all"
              style="box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25)"
              :class="
                msg.senderId === activeUser.id ? 'rounded-br-xl ml-3 bg-[#fff]' : 'rounded-bl-xl mr-3 bg-[#D7FEE4]'
              "
            >
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>
      <div
        class="send-bar h-[74px] rounded-xl bg-white p-4 mx-6 mb-[40px]"
        :class="activeUser.state === UserState.OFFLINE ? 'input-disabled' : null"
        style="box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25)"
      >
        <input
          v-model="message"
          :disabled="activeUser.state === UserState.OFFLINE"
          type="text"
          class="w-full h-full p-1 flex-1"
          @keyup.enter="sendMessage"
          :placeholder="sendInputPlaceholder"
        />
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
// input:disabled {
//   background-color: transparent;
// }

.input-disabled {
  background-color: #efefef4d;
}

.profile .avatar {
  background: #d9d9d9;
  border: 2px solid #ffffff;
  box-shadow: 4px 4px 6px rgba(197, 197, 197, 0.25);
}
</style>
