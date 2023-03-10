var jwt = require('jsonwebtoken');
const sha = 'kotoooooo'

const userTokens = {

}

function generaToken(userId, data = {}) {
    var token = jwt.sign(data, sha, { expiresIn: '2h' });
    userTokens[userId] = token
    return token
}

function checkTokenValid(userId, token) {
    if (userTokens[userId] !== token) {
        return false
    }
    try {
        jwt.verify(token, sha);
        return true
    } catch (err) {
        return false
    }
}


function decode(token) {
    try {
        return jwt.verify(token, sha);
    } catch (err) {
        return null
    }
}

module.exports = {
    generaToken,
    checkTokenValid,
    decode
}