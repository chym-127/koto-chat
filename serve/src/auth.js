var jwt = require('jsonwebtoken');

function generaToken(data = {}) {
    var token = jwt.sign(data, 'kotoooooo', { expiresIn: '2h' });
    return token
}

function checkTokenValid(token) {
    try {
        jwt.verify(token, 'kotoooooo');
        return true
    } catch (err) {
        return false
    }
}


function decode(token) {
    try {
        return jwt.verify(token, 'kotoooooo');
    } catch (err) {
        return {}
    }
}

module.exports = {
    generaToken,
    checkTokenValid,
    decode
}