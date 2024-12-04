const { Router } = require('express')
const { body } = require('express-validator')
const Users = require('./../model/User')
const authController = require('./../controllers/auth')

const router = Router()

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom(async (email, { req }) => {
            const user = await Users.findOne({email})
            if(user) 
                return Promise.reject('Email already exists')
            return Promise.resolve()

        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min:5 }),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('the name is required')
], authController.signup)
router.post('/login', authController.login)

module.exports = router