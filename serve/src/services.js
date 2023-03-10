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
    const stmt = db.prepare('SELECT id,username FROM users where id != 1');
    const users = stmt.all();
    return users
}

function getRobot() {
    const stmt = db.prepare('SELECT id,username FROM users WHERE id = ?');
    const user = stmt.get(1);
    return user
}

module.exports = {
    createUser,
    listUsers,
    getRobot,
    findUserByUsername,
    findUserByUsernameWithPassword
}