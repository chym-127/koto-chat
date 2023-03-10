const { listUsers, getRobot } = require('./services')
let users = []
let robot = null
let socketIO = null

function initUsers() {
    robot = getRobot()
    robot.state = 2
    const arr = listUsers()
    users = arr.map((user) => {
        return {
            ...user,
            state: 1 //1：离线 2：在线
        }
    })
}

function addUser(user) {
    let temp = {
        ...user,
        state: 1 //1：离线 2：在线
    }
    users.push(temp)
    socketIO.sockets.emit('on_users', {
        type: "add",
        user: temp
    })
}

function removeUser(id) {
    for (let index = 0; index < users.length; index++) {
        let user = users[index];
        if (user.id === id) {
            users.splice(index, 1)
        }
    }
}

function updateUser(id, data) {
    for (let index = 0; index < users.length; index++) {
        let user = users[index]
        if (user.id === id) {
            users[index] = { ...user, ...data }
            socketIO.sockets.emit('on_users', {
                type: "update",
                user: users[index]
            })
        }
    }
}

function getUsers() {
    return users
}

function getRobotUser() {
    return robot
}

function initUserManage(io) {
    socketIO = io
    initUsers()
}


module.exports = {
    initUserManage,
    addUser,
    removeUser,
    getUsers,
    getRobotUser,
    updateUser
}