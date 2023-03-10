const db = require('better-sqlite3')('chat.db', {});
const tables = [
    {
        name: 'users',
        fileds: [
            'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
            'username varchar(20)',
            'password varchar(20)'
        ],
    }
]


// 创建所有表
function initTables() {
    for (let index = 0; index < tables.length; index++) {
        const table = tables[index];
        const createUserTable = `
            CREATE TABLE IF NOT EXISTS ${table.name} (${table.fileds.join(',')})
        `
        db.exec(createUserTable);
    }
    const stmt = db.prepare('SELECT id,username FROM users WHERE id = ?');
    const user = stmt.get(1);
    if (!user) {
        const stm = `
            INSERT INTO users (username,password) VALUES('Chen','123456789')
        `
        db.exec(stm);
    }
}

//删除所有表
function dropAllTable() {
    for (let index = 0; index < tables.length; index++) {
        const table = tables[index];
        const createUserTable = `
            DROP TABLE  IF  EXISTS ${table.name}
        `
        db.exec(createUserTable);
    }
}
// dropAllTable()
initTables()
// db.close()

module.exports = { db }