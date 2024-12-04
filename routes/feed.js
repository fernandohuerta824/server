const { Router } = require('express')
const { body } = require('express-validator')
const isAuth = require('./../middlewares/is-auth')
const feedControllers = require('./../controllers/feed')

const router = Router();
router.use(isAuth)
router.get('/posts', feedControllers.getPosts)
router.post('/post', [
    body('title')
        .trim()
        .isLength({
            min: 5,
            max: 60
        })
        .withMessage('The title should be 5 to 60 characters long.'),
    body('content')
        .trim()
        .isLength({
            min: 5,
            max: 200
        })
        .withMessage('The content should be 5 to 60 characters long.')
], feedControllers.addPost)
router.get('/post/:id', feedControllers.getPost)
router.put('/post/:id', [
    body('title')
        .trim()
        .isLength({
            min: 5,
            max: 60
        })
        .withMessage('The title should be 5 to 60 characters long.'),
    body('content')
        .trim()
        .isLength({
            min: 5,
            max: 200
        })
        .withMessage('The content should be 5 to 60 characters long.')
], feedControllers.updatePost)
router.delete('/post/:id', feedControllers.deletePost)
router.get('/status', feedControllers.getStatus)
router.put('/status',[
    body('status')
        .trim()
        .isLength({min:2})
        .withMessage('The title should be almost 2 characters long.')
], feedControllers.updateStatus)


module.exports = router