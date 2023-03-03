var os = require('os');
const { decode } = require('./auth')
const { addUser, removeUser, updateUser, getUsers } = require('./users-manage')

const db = require('./db.js')
const userMapper = {}
function initSocket(io) {
    io.sockets.on('connection', function (socket) {
        const token = socket.handshake.auth.token;
        const user = decode(token)
        updateUser(user.id, { state: 2 })
        userMapper[user.id] = {
            ...user,
            socketId: socket.id
        }
        socket.on("login", (room) => {
            let currentRoomUserCount = io.sockets.adapter.rooms.get(room);
            if (!currentRoomUserCount) {
                socket.join(room)
                io.sockets.in(room).emit("message", { success: true })
            } else {
                socket.join(room)
            }
        })
        // 发起呼叫请求
        socket.on('req_call', (userId) => {
            const u = userMapper[userId]
            if (u) {
                io.sockets.to(u.socketId).emit('req_call', {
                    id: user.id,
                    username: user.username
                })
            }
        })
        // 响应呼叫
        socket.on('res_call', (msg) => {
            // socket.join(id)
            console.log(msg);
            // io.sockets.in(id).emit("create-peer", { success: true })
        })
        socket.on('message', (message, room) => {
            socket.to(room).emit("message", message)
        })
        socket.on('ipaddr', function () {
            var ifaces = os.networkInterfaces();
            for (var dev in ifaces) {
                ifaces[dev].forEach(function (details) {
                    if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                        socket.emit('ipaddr', details.address);
                    }
                });
            }
        });
        socket.on('bye', function () {
            console.log('received bye');
        });
    });
}


module.exports = initSocket