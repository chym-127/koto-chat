var express = require('express');
var app = express();
var cors = require('cors')
const { generaToken,
    checkTokenValid,
    decode } = require('./auth')

const { addUser, removeUser, updateUser, getUsers, getRobotUser } = require('./users-manage')
const { createUser, findUserByUsername, findUserByUsernameWithPassword, listUsers } = require('./services')
class BaseRes {
    constructor() { }
    msg(msg) {
        this._msg = msg
        return this
    }
    code(code) {
        this._code = code
        return this
    }
    data(data) {
        this._data = data
        return this
    }
    details(details) {
        this._details = details
        return this
    }

    end() {
        return {
            code: this._code,
            msg: this._msg,
            data: this._data,
            details: this._details,
        }
    }
}

class SuccessRes extends BaseRes {
    constructor() {
        super()
        this._msg = "success"
        this._code = 0
        this._data = {}
        this._details = ""
    }
}
class ErrorRes extends BaseRes {
    constructor() {
        super()
        this._msg = "fail"
        this._code = 1
        this._data = {}
        this._details = ""
    }
}
const successRes = () => new SuccessRes()
const errorRes = () => new ErrorRes()



app.use(express.json());
app.use(cors({
    "Access-Control-Allow-Origin": "*"
}))
app.get("/", function (req, res) {
    res.send("hello")
});

function checkRegisterParams(params = {}) {
    if (!params.username) {
        return errorRes().msg("参数错误").code(100).details("missing username").end()
    }

    if (!params.password) {
        return errorRes().msg("参数错误").code(100).details("missing password").end()
    }

    return successRes().end()
}


function auth() {
    return (req, res, next) => {
        let token = req.get('Token')
        if (token && checkTokenValid(token)) {
            next()
        } else {
            res.status(401).json(errorRes().end())
        }
    }
}

app.post('/register', function (req, res) {
    const requestData = req.body || {}
    const resp = checkRegisterParams(requestData)
    if (resp.code !== 0) {
        res.json(resp)
    } else {
        try {
            const user = findUserByUsername(requestData.username)
            if (user) {
                res.json(errorRes().code(101).details("用户名已存在").end())
            } else {
                createUser({
                    username: requestData.username,
                    password: requestData.password
                })
                const u = findUserByUsername(requestData.username)
                if (u) {
                    addUser(u)
                }
                res.json(successRes().details("注册成功").end())
            }
        } catch (error) {
            res.json(errorRes().end())
        }
    }
});


app.post("/login", (req, res) => {
    const requestData = req.body || {}
    const resp = checkRegisterParams(requestData)
    if (resp.code !== 0) {
        res.json(resp)
    } else {
        try {
            const user = findUserByUsernameWithPassword(requestData.username, requestData.password)
            if (user) {
                let token = generaToken(user)
                res.json(successRes().data({
                    token: token, userInfo: {
                        id: user.id,
                        username: user.username,
                        state: user.state
                    }
                }).end())
            } else {
                res.json(errorRes().code(103).details("账户不存在或密码错误").end())
            }
        } catch (error) {
            res.json(errorRes().end())
        }
    }
})

app.post('/list/user', (req, res) => {
    try {
        const users = getUsers()
        const robot = getRobotUser()
        res.json(successRes().data({
            items: users,
            robot: robot
        }).end())
    } catch (error) {
        res.json(errorRes().end())
    }
})

module.exports = {
    app
}