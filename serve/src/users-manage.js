const { listUsers } = require('./services')
let users = []

let socketIO = null

function initUsers() {
    const arr = listUsers()
    users = arr.map((user) => {
        return {
            ...user,
            state: 1 //1：离线 2：在线
        }
    })
    console.log(users);
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

function initUserManage(io) {
    socketIO = io
    initUsers()
}


module.exports = {
    initUserManage,
    addUser,
    removeUser,
    getUsers,
    updateUser
}