const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.get('Authorization')?.split(' ')[1]
    if(!token) {
        req.isAuth = false
        return next()
    }

    try {
        const decodedToken = jwt.verify(token, 'somesupersecretsecretprivatekey')

        if(!decodedToken) {
            req.isAuth = false
            return next()
        }

        req.userId = decodedToken.userId
        req.isAuth = true
        return next()
    } catch(error) {
        req.isAuth = false
        return next()
    }
}