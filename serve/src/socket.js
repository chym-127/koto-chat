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
        socket.on('disconnect', function() {
            updateUser(user.id, { state: 1 })
         });
        // 发起呼叫请求
        socket.on('req_call', (userId) => {
            const u = userMapper[userId]
            console.log(u);
            if (u) {
                io.sockets.to(u.socketId).emit('req_call', {
                    id: user.id,
                    username: user.username
                })
            }
        })
        // 响应呼叫
        socket.on('res_call', (msg) => {
            let u1 = userMapper[msg.user.id]
            io.sockets.to(u1.socketId).emit("res_call", { ack: msg.ack, user: { id: user.id, username: user.username } })
        })
        socket.on('send_sdp', (message) => {
            let rUser = userMapper[message.receiverId]
            io.sockets.to(rUser.socketId).emit("receive_sdp", message)
        })

        socket.on('send_msg', function (msg) {
            let u1 = userMapper[msg.receiverId]
            io.sockets.to(u1.socketId).emit("receive_msg", msg)
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