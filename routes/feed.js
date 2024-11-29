const { Router } = require('express')
const feedControllers = require('./../controllers/feed')
const router = Router();

router.get('/posts', feedControllers.getPosts)

module.exports = router