<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { CallAck, SDPMessage, socket } from '@libs/socketHelper';
import { User } from '../types';
import { CallState } from './types';
import ringtonePath from '@assets/ringtone.mp3';
import { getAvatarByUserId } from '@libs/avatar';

const props = defineProps({
  senderId: {
    type: Number,
    required: true,
  },
});

const turnConfig = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302', 'stun:stun3.l.google.com:19302'],
    },
  ],
};
const localStreamConstraints = {
  audio: true,
};
let localAudio: any;
let remoteAudio: any;
let ringtonesAudio: any;
let localStream: any = null;
let remoteStream: any = null;

let pc: any;
// 获取许可
function init() {
  navigator.mediaDevices
    .getUserMedia(localStreamConstraints)
    .then((stream) => {
      localStream = stream;
      // 将本地流作为本地音频标签的源
      localAudio.srcObject = stream;
    })
    .catch(function (e) {
      alert('getUserMedia() error: ' + e.name);
    });
}
// 创建peer对象
function createRTCPeerConnection() {
  pc = new RTCPeerConnection(turnConfig);
  pc.onicecandidate = handleIceCandidate;
  pc.onaddstream = handleRemoteStreamAdded;
  pc.onremovestream = handleRemoteStreamRemoved;
  pc.addStream(localStream);
}
// ice 候选地址回调 收到回调就传给对方
function handleIceCandidate(event: any) {
  if (event.candidate) {
    sendSDPMessage({
      type: 'candidate',
      data: {
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      },
      senderId: props.senderId,
      receiverId: targetUser!.id,
    });
  } else {
    console.log('End of candidates.');
  }
}
// 对方流
function handleRemoteStreamAdded(event: any) {
  status.value = CallState.CALLING;
  remoteStream = event.stream;
  remoteAudio.srcObject = remoteStream;
}
function handleRemoteStreamRemoved() {}

// --------- 业务逻辑
// 通话对方
let targetUser: User | null;
// 双方是否建立了连接
let isChannelReady = false;
const status = ref<CallState>(CallState.NORMAL); //0: 无状态 1：呼叫者状态 2：被呼叫者的状态
const duration = ref('');
// 发送信令
function sendSDPMessage(msg: SDPMessage) {
  socket.emit('send_sdp', msg);
}

// 发起呼叫请求
function call(user: User) {
  status.value = CallState.CALLER;
  targetUser = user;
  socket.emit('req_call', targetUser.id);
}

onMounted(() => {
  localAudio = document.querySelector('#localAudio');
  remoteAudio = document.querySelector('#remoteAudio');
  ringtonesAudio = document.querySelector('#ringtonesAudio');
  ringtonesAudio.addEventListener(
    'ended',
    function () {
      if (status.value === CallState.CALLED || status.value === CallState.CALLER) {
        ringtonesAudio.currentTime = 0;
        ringtonesAudio.play();
      }
    },
    false
  );
  remoteAudio.ontimeupdate = function () {
    const result = new Date(remoteAudio.currentTime * 1000).toISOString().slice(11, 19);
    duration.value = result;
  };
  init();
});

// 监听呼叫请求
socket.on('req_call', (u) => {
  if (status.value !== CallState.NORMAL) {
    socket.emit('res_call', {
      ack: CallAck.ISCALLING,
      user: u,
    });
  } else {
    status.value = CallState.CALLED;
    targetUser = u;
  }
});

//监听呼叫响应
socket.on('res_call', (msg) => {
  // 同意通话
  if (msg.ack === CallAck.AGREE) {
    isChannelReady = true;
    createRTCPeerConnection();
    pc.createOffer().then((offer: any) => {
      pc.setLocalDescription(offer);
      //发送offer
      sendSDPMessage({
        type: 'offer',
        data: offer,
        senderId: props.senderId,
        receiverId: targetUser!.id,
      });
    });
  } else if (msg.ack === CallAck.ISCALLING) {
    recovery();
    alert('对方正在通话中');
  } else if (status.value !== CallState.NORMAL && msg.ack === CallAck.HANGUP && targetUser!.id === msg.user.id) {
    recovery();
  }
});

//监听SDP
socket.on('receive_sdp', (msg) => {
  let type = msg.type;
  switch (type) {
    case 'offer':
      pc.setRemoteDescription(new RTCSessionDescription(msg.data));
      pc.createAnswer().then((answer: any) => {
        pc.setLocalDescription(answer);
        sendSDPMessage({
          type: 'answer',
          data: answer,
          senderId: msg.receiverId,
          receiverId: msg.senderId,
        });
      });
      break;
    case 'answer':
      pc.setRemoteDescription(new RTCSessionDescription(msg.data));
      break;
    case 'candidate':
      if (isChannelReady) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: msg.data.label,
          candidate: msg.data.candidate,
        });
        pc.addIceCandidate(candidate);
      }
      break;
    default:
      break;
  }
});

watch(status, () => {
  //播放铃声
  if (status.value === CallState.CALLED || status.value === CallState.CALLER) {
    ringtonesAudio.currentTime = 0;
    setTimeout(() => {
      ringtonesAudio.play();
    }, 300);
  } else {
    ringtonesAudio.pause();
  }
});

// 接受通话
function agreeCall() {
  isChannelReady = true;
  createRTCPeerConnection();
  socket.emit('res_call', {
    ack: CallAck.AGREE,
    user: targetUser!,
  });
}

//发起挂断请求
function hangUp() {
  if (targetUser) {
    socket.emit('res_call', {
      ack: CallAck.HANGUP,
      user: targetUser,
    });
    recovery();
  }
}

// 恢复到正常状态
function recovery() {
  isChannelReady = false;
  targetUser = null;
  status.value = CallState.NORMAL;
  remoteAudio.srcObject = null;
}

defineExpose({
  call,
});

//#cd3a4a red
//#1ccf11 green
</script>
<template>
  <div
    class="bg-white p-2 w-[250px] h-[348px] shadow-md call-center rounded-xl"
    :class="status === CallState.NORMAL ? null : 'show'"
  >
    <audio id="localAudio" class="invisible absolute" autoplay controls muted></audio>
    <audio id="remoteAudio" class="invisible absolute" autoplay controls></audio>
    <audio id="ringtonesAudio" :src="ringtonePath" class="invisible absolute"></audio>

    <div class="p-8" v-show="status !== CallState.NORMAL">
      <div class="user w-full flex flex-col items-center mb-24">
        <div class="pic h-[64px] w-[64px] bg-[#f0f0f0] rounded-full">
          <img
            v-if="targetUser"
            :src="getAvatarByUserId(targetUser!.id % 20)"
            class="h-[64px] w-[64px] bg-[#f0f0f0] rounded-full"
            alt=""
            srcset=""
          />
        </div>
        <div class="username mt-2">{{ targetUser?.username }}</div>
      </div>
      <div class="duration text-center" v-show="status === CallState.CALLING">
        <span>{{ duration }}</span>
      </div>
      <div class="operation flex" :class="status === CallState.CALLED ? 'justify-between' : 'justify-center'">
        <div class="text-center" @click="hangUp">
          <div class="rounded-full h-[48px] cursor-pointer w-[48px] bg-[#cd3a4a] flex justify-center items-center mb-1">
            <img src="../../assets/call.png" class="h-[24px] w-[24px]" alt="" srcset="" />
          </div>
          <span class="text-center">{{ status === CallState.CALLED ? '拒绝' : '取消' }}</span>
        </div>

        <div class="text-center" v-if="status === CallState.CALLED" @click="agreeCall">
          <div class="rounded-full h-[48px] cursor-pointer w-[48px] bg-[#1ccf11] flex justify-center items-center mb-1">
            <img src="../../assets/call.png" class="h-[24px] w-[24px] rotate-[135deg]" alt="" srcset="" />
          </div>
          <span class="text-center">接听</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.call-center {
  transition: top 0.5s;
  top: -100%;
  position: absolute;
  right: 20px;
}
.call-center.show {
  top: 10px;
}
</style>
