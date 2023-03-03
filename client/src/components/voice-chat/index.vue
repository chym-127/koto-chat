<script setup lang="ts">
import { onMounted } from 'vue';
import { CallAck, SDPMessage, socket } from '../../libs/socketHelper';
const props = defineProps({
  senderId: {
    type: Number,
    required: true,
  },
  receiverId: {
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
let localAudio: any = document.querySelector('#localAudio');
let remoteAudio: any = document.querySelector('#remoteAudio');
let localStream: any = null;
let remoteStream: any = null;
let pc: any;
function createRTCPeerConnection() {
  // new 一个RTCPeerConnection对象 传入turn服务器参数
  pc = new RTCPeerConnection(turnConfig);
  pc.onicecandidate = handleIceCandidate;
  // pc.onaddstream = handleRemoteStreamAdded;
  // pc.onremovestream = handleRemoteStreamRemoved;
  pc.addStream(localStream);
  pc.createOffer().then((offer: any) => {
    // console.log(offer);
    pc.setLocalDescription(offer);
    sendSDPMessage({
      type: 'offer',
      userId: props.senderId,
      data: offer,
    });
    // sendMessage(offer)
    console.log('create offer success');
  });
}

function init() {
  navigator.mediaDevices
    .getUserMedia(localStreamConstraints)
    .then(gotStream)
    .catch(function (e) {
      alert('getUserMedia() error: ' + e.name);
    });
}

function gotStream(stream: any) {
  localStream = stream;
  // 将本地流作为本地音频标签的源
  localAudio.srcObject = stream;
  createRTCPeerConnection();
}

function sendSDPMessage(msg: SDPMessage) {
  socket.emit('send_sdp', msg);
}

function onSDPMessage() {
  socket.on('receive_sdp', (msg) => {
    console.log(msg);
  });
}

// 监听呼叫响应
socket.on('res_call', (msg) => {
  switch (msg.ack) {
    case CallAck.STARTCONN:
      console.log('start connect');
      break;

    default:
      break;
  }
});

function handleIceCandidate() {}

onMounted(() => {});

function startChat() {
    init()
}

defineExpose({
  startChat,
});
</script>
<template>
  <div>
    <audio id="localAudio" class="" autoplay controls muted></audio>
    <audio id="remoteAudio" class="" autoplay controls muted></audio>
  </div>
</template>
