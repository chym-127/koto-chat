const { db } = require('./db')

function createUser(user) {
    const stm = `
           INSERT INTO users (username,password) VALUES('${user.username}','${user.password}')
        `
    db.exec(stm);
}


function findUserByUsername(username) {
    const stmt = db.prepare('SELECT id,username FROM users WHERE username = ?');
    const user = stmt.get(username);
    return user
}


function findUserByUsernameWithPassword(username, password) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? and password = ?');
    const user = stmt.get(username, password);
    return user
}

function listUsers() {
    const stmt = db.prepare('SELECT id,username FROM users');
    const users = stmt.all();
    return users
}

module.exports = {
    createUser,
    listUsers,
    findUserByUsername,
    findUserByUsernameWithPassword
}