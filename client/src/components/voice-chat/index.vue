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
function init() {
  navigator.mediaDevices
    .getUserMedia(localStreamConstraints)
    .then(gotStream)
    .catch(function (e) {
      alert('getUserMedia() error: ' + e.name);
    });
}
function createRTCPeerConnection() {
  // new 一个RTCPeerConnection对象 传入turn服务器参数
  pc = new RTCPeerConnection(turnConfig);
  pc.onicecandidate = handleIceCandidate;
  pc.onaddstream = handleRemoteStreamAdded;
  pc.onremovestream = handleRemoteStreamRemoved;
  pc.addStream(localStream);

}
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
function handleRemoteStreamAdded(event: any) {
  console.log('Remote stream added.');
  remoteStream = event.stream;
  remoteAudio.srcObject = remoteStream;
}
function handleRemoteStreamRemoved() {
}
function gotStream(stream: any) {
  localStream = stream;
  // 将本地流作为本地音频标签的源
  localAudio.srcObject = stream;
  createRTCPeerConnection()
}


// --------- 业务逻辑
// 通话对方的id
let targetId: number;
// 双方是否建立了连接
let isChannelReady = false

function sendSDPMessage(msg: SDPMessage) {
  socket.emit('send_sdp', msg);
}

// 发起呼叫请求
function call(userId: number) {
  socket.emit('req_call', userId);
}

onMounted(() => {
  localAudio = document.querySelector('#localAudio');
  remoteAudio = document.querySelector('#remoteAudio');
  init()
});


let caller: User;
// 监听呼叫请求
socket.on('req_call', (u) => {
  caller = u
});

//监听呼叫响应
socket.on('res_call', (msg) => {
  if (msg.ack === CallAck.AGREE) {
    targetId = msg.user.id
    isChannelReady = true
    //发送offer
    pc.createOffer().then((offer: any) => {
      // console.log(offer);
      pc.setLocalDescription(offer);
      sendSDPMessage({
        type: 'offer',
        data: offer,
        senderId: props.senderId,
        receiverId: targetId
      });
      // sendMessage(offer)
      console.log('create offer success');
    });
  }
  console.log(msg);
});


//监听SDP
socket.on('receive_sdp', (msg) => {
  let type = msg.type
  switch (type) {
    case 'offer':
      pc.setRemoteDescription(new RTCSessionDescription(msg.data));
      pc.createAnswer().then((answer: any) => {
        console.log('create answer success');
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
      console.log('setRemoteDescription');
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
    <div>
      <button class="mr-2" @click="agreeCall">接受</button>
      <button>拒绝</button>
    </div>
  </div>
</template>
