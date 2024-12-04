const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const token = req.get('Authorization')?.split(' ')[1]
    if(!token) {
        const error = new Error()
        error.message = 'Not authenticated'
        error.status = 401
        throw error;
    }

    try {
        const decodedToken = jwt.verify(token, 'somesupersecretkey')

        if(!decodedToken) {
            const error = new Error()
            error.message = 'Not authenticated'
            error.status = 401
            throw error;
        }

        req.userId = decodedToken._id

        next()
    } catch(error) {
        error.status ||= 500
        error.message ||= 'Something failed, try again, if the problem persists contact support.'
        next(error)
    }
}