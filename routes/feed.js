const { Router } = require('express')
const feedControllers = require('./../controllers/feed')
const router = Router();

router.get('/posts', feedControllers.getPosts)
router.post('/post', feedControllers.addPost)

module.exports = router