import { io, Socket } from 'socket.io-client';
import { User } from '../components/home/types';

interface UserMessage {
  type: string;
  user: User;
}

enum CallAck {
  AGREE = 1, //同意呼叫请求
  REJECT, //拒绝呼叫请求
  STARTCONN, //开始连接
}

// 呼叫响应信息
interface ResCallMessage {
  ack: CallAck;
  user: User;
  room?: string 
}
// 发送信令
interface SDPMessage {
  data: any;
  type: string;
  userId: number;
}

interface ServerToClientEvents {
  on_users: (userMessage: UserMessage) => void;
  req_call: (user: User) => void;
  send_sdp: (msg: SDPMessage) => void;
  receive_sdp: (msg: SDPMessage) => void;
  res_call: (resCallMessage: ResCallMessage) => void;
}

interface ClientToServerEvents {
  req_call: (id: number) => void;
  res_call: (resCallMessage: ResCallMessage) => void;
  send_sdp: (msg: SDPMessage) => void;
  receive_sdp: (msg: SDPMessage) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;
function initSocket() {
  socket = io('http://localhost:8000', {
    auth: {
      token: localStorage.getItem('TOKEN'),
    },
  });
}
export { socket, initSocket, CallAck };

export type { UserMessage, ResCallMessage, SDPMessage };
