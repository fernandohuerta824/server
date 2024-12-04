const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Users = require('./../model/User')

module.exports.signup = async (req, res, next) => {
    try {
        const { email, name, password } = req.body
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            const error = new Error()
            error.message = errors.array()[0].msg
            error.status = 422
            throw error
        }

        const hashedPassword = await bcrypt.hash(password, 12)

       await new Users({
            email,
            password: hashedPassword,
            name
        }).save()

        res.status(201).json({message: 'User successfully registered'})
    } catch(error) {
        error.status ||= 500
        error.message ||= 'Something failed to signup, try again, if the problem persists contact support.'
        next(error)
    }
}

module.exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await Users.findOne({email})

        if(!user) {
            const error = new Error()
            error.message = 'Incorrect email or password'
            error.status = 401
            throw error
        }

        const isAuth = await bcrypt.compare(password, user.password)

        if(!isAuth) {
            const error = new Error()
            error.message = 'Incorrect email or password'
            error.status = 401
            throw error
        }

        const jwtToken = jwt.sign({ 
            email, _id: 
            user._id.toString() }
            ,'somesupersecretkey' 
            ,{ expiresIn: '1h' })

        res.status(200).json({message: 'Correct authentication', token: jwtToken})
    } catch(error) {
        error.status ||= 500
        error.message ||= 'Something failed to login, try again, if the problem persists contact support.'
        next(error)
    }
}