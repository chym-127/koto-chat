<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CallAck, SDPMessage, socket } from '../../libs/socketHelper';
import { User } from '../home/types';
const props = defineProps({
  senderId: {
    type: Number,
    required: true,
  }
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
      createRTCPeerConnection()
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
        candidate: event.candidate.candidate
      },
      senderId: props.senderId,
      receiverId: targetId
    });
  } else {
    console.log('End of candidates.');
  }
}
// 对方流
function handleRemoteStreamAdded(event: any) {
  remoteStream = event.stream;
  remoteAudio.srcObject = remoteStream;
}
function handleRemoteStreamRemoved() {
}

// --------- 业务逻辑
// 通话对方的id
let targetId: number;
// 双方是否建立了连接
let isChannelReady = false
const status = ref(0) //0: 无状态 1：呼叫者状态 2：被呼叫者的状态

// 发送信令
function sendSDPMessage(msg: SDPMessage) {
  socket.emit('send_sdp', msg);
}

// 发起呼叫请求
function call(userId: number) {
  status.value = 1
  socket.emit('req_call', userId);
}

onMounted(() => {
  localAudio = document.querySelector('#localAudio');
  remoteAudio = document.querySelector('#remoteAudio');
  init()
});

// 呼叫者
let caller: User;
// 监听呼叫请求
socket.on('req_call', (u) => {
  status.value = 2
  caller = u
});

//监听呼叫响应
socket.on('res_call', (msg) => {
  if (msg.ack === CallAck.AGREE) {
    targetId = msg.user.id
    isChannelReady = true
    pc.createOffer().then((offer: any) => {
      pc.setLocalDescription(offer);
      //发送offer
      sendSDPMessage({
        type: 'offer',
        data: offer,
        senderId: props.senderId,
        receiverId: targetId
      });
    });
  }
});

//监听SDP
socket.on('receive_sdp', (msg) => {
  let type = msg.type
  switch (type) {
    case 'offer':
      pc.setRemoteDescription(new RTCSessionDescription(msg.data));
      pc.createAnswer().then((answer: any) => {
        pc.setLocalDescription(answer);
        sendSDPMessage({
          type: 'answer',
          data: answer,
          senderId: msg.receiverId,
          receiverId: msg.senderId
        });
      })
      break;
    case 'answer':
      pc.setRemoteDescription(new RTCSessionDescription(msg.data));
      break
    case 'candidate':
      if (isChannelReady) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: msg.data.label,
          candidate: msg.data.candidate
        });
        pc.addIceCandidate(candidate);
      }
      break
    default:
      break;
  }
})

// 接受通话
function agreeCall() {
  isChannelReady = true
  targetId = caller.id
  socket.emit('res_call', {
    ack: CallAck.AGREE,
    user: caller,
  });
}

defineExpose({
  call
});
</script>
<template>
  <div class="fixed top-10 right-20 bg-white p-2 shadow-md">
    <audio id="localAudio" class="" autoplay controls muted></audio>
    <audio id="remoteAudio" class="" autoplay controls muted></audio>
    <!-- 呼叫者 -->
    <div class="caller" v-show="status === 1">
      正在发起呼叫
    </div>
    <!-- 被呼叫 -->
    <div class="called" v-show="status === 2">
      <p> 有人对你发起呼叫，请问是否接受</p>
      <button class="mr-2" @click="agreeCall">接受</button>
      <button>拒绝</button>
    </div>
  </div>
</template>
