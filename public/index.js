var room = prompt('Enter your name:');
var socket = io.connect("http://localhost:8000");

// socket.emit("create or join", room)
const turnConfig = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302"
            ]
        }
    ]
}

const localStreamConstraints = {
    audio: true
}


var localAudio = document.querySelector('#localAudio');
var remoteAudio = document.querySelector('#remoteAudio');
let localStream = null
let remoteStream = null

获取音视频流
navigator.mediaDevices.getUserMedia(localStreamConstraints)
    .then(gotStream)
    .catch(function (e) {
        alert('getUserMedia() error: ' + e.name);
    });

socket.on('message', (message) => {
    if (message.type === 'offer') {
        pc.setRemoteDescription(new RTCSessionDescription(message));
        pc.createAnswer().then(resp => {
            console.log(resp);
        });
    }
    console.log(message);
})


socket.on('req-call', (id) => {
    if (window.confirm(`${id} calling? yes/no`)) {
        socket.emit('res-call', id)
    }
})


function createRTCPeerConnection() {
    // new 一个RTCPeerConnection对象 传入turn服务器参数
    pc = new RTCPeerConnection(turnConfig);
    pc.onicecandidate = handleIceCandidate;
    // pc.onaddstream = handleRemoteStreamAdded;
    // pc.onremovestream = handleRemoteStreamRemoved;
    pc.addStream(localStream);
    pc.createOffer().then(offer => {
        // console.log(offer);
        pc.setLocalDescription(offer)
        sendMessage(offer)
        console.log('create offer success');
    })
}

function sendMessage(data) {
    socket.emit("message", data, room)
}

function handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
        // sendMessage({
        //     type: 'candidate',
        //     label: event.candidate.sdpMLineIndex,
        //     id: event.candidate.sdpMid,
        //     candidate: event.candidate.candidate
        // }, room);
    } else {
        console.log('End of candidates.');
    }
}

function gotStream(stream) {
    localStream = stream
    // 将本地流作为本地音频标签的源
    localAudio.srcObject = stream
    createRTCPeerConnection()
}

