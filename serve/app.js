const { app } = require('./src/api')

var socketIO = require('socket.io');
const http = require('http')
var server = http.createServer(app);
server.listen(process.env.PORT || 8000);

var io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const initSocket = require('./src/socket.js')
initSocket(io)

const { initUserManage } = require('./src/users-manage')
initUserManage(io)