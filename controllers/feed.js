const { validationResult } = require('express-validator')
const fs = require('fs')
const path = require('path')
const Posts = require('./../model/Posts')
const Users = require('./../model/User')

const { Types } = require('mongoose')

module.exports.getPosts = async(req, res, next) => {
    try {
      const queryPage = parseInt(req.query.page);
      const totalItems = await Posts.countDocuments()
      const limit = 2;
      const totalPages = Math.ceil(totalItems / limit)
      const currentPage = queryPage < 1 || !Number.isFinite(queryPage) ? 1 : queryPage > totalPages ? totalPages : queryPage || 1
      const skip = (currentPage - 1) * limit
      const posts = await Posts.find().skip(skip < 0 ? 0 :  skip).limit(limit);
    
      res.status(200).json({
        posts,
        totalItems,
      })
    } catch(error) {
      error.status ||= 500
      error.message ||= 'Something failed to retrieve the posts, try again, if the problem persists contact support.'
      next(error)
    }
}

module.exports.addPost = async (req, res, next) => {
    try {
      const { title, content } = req.body
      const imageURL = req.file.path.replace("\\" ,"/")
      const errors = validationResult(req)

      if(!errors.isEmpty()) {
        const error = new Error("Validation fail")
        error.message = errors.array()[0].msg
        error.status = 422
        throw error
      }

      if(!req.file) {
        const error = new Error("Validation fail")
        error.message = 'No image provided'
        error.status = 422
        throw error
      }
      
      const post = await new Posts({
        title,
        content,
        imageURL,
        creator: req.userId
      }).save()   

      const user = await Users.findById(req.userId)

      user.posts.push(post)
      await user.save()
      res.status(201).json({
          "status": '201',
          "message": 'Post created successfully',
          "post": post
      })
    } catch(error) {
      error.status ||= 500
      error.message ||= 'Something failed when creating a new post, try again, if the problem persists contact support.'
      next(error)
    }
}

module.exports.getPost = async (req, res, next) => {
  try {
    const id = req.params.id
    if(!Types.ObjectId.isValid(id)) {
      const error = new Error("Post not found")
      error.message = 'Post not found'
      error.status = 404
      throw error
    }
    const post = await Posts.findById(id)
    if(!post) {
      const error = new Error("Post not found")
      error.message = 'Post not found'
      error.status = 404
      throw error
    }
    res.status(200).json({post})
  } catch(error) {
    error.status ||= 500
    error.message ||= 'Something failed to retrieve the post, try again, if the problem persists contact support.'
    next(error)
  }
}

module.exports.updatePost = async (req, res, next) => {
  try {
    const id = req.params.id
    const { title, content } = req.body
    const imageURL = req.file?.path.replace("\\" ,"/")
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      const error = new Error("Validation fail")
      error.message = errors.array()[0].msg
      error.status = 422
      throw error
    }

    if(!Types.ObjectId.isValid(id)) {
      const error = new Error("Post not found")
      error.message = 'Post not found'
      error.status = 404
      throw error
    }

    const post = await Posts.findById(id)

    if(!post) {
      const error = new Error("Post not found")
      error.message = 'Post not found'
      error.status = 404
      throw error
    }

    if(post.creator.toString() !== req.userId) {
      const error = new Error()
      error.message = 'This action is not allow for you'
      error.status = 403
      throw error
    }
    
    post.title = title
    post.content = content

    if(imageURL) {
      fs.unlink(path.join(__dirname, '..', post.imageURL), (error) => {
        if(error)
          throw error
      })
      post.imageURL = imageURL
    }

    post.isNew = false

    await post.save()

    res.status(200).json({post: post})
  } catch(error) {
    error.status ||= 500
    error.message ||= 'Something failed to updated the post, try again, if the problem persists contact support.'
    next(error)
  }
}

module.exports.deletePost = async (req, res, next) => {
  try {
    const id = req.params.id
 
  
    if(!Types.ObjectId.isValid(id)) {
      const error = new Error("Post not found")
      error.message = 'Post not found'
      error.status = 404
      throw error
    }
    const post = await Posts.findById(id)
  
    if(!post) {
      const error = new Error("Post not found")
      error.message = 'Post not found'
      error.status = 404
      throw error
    }

    if(post.creator.toString() !== req.userId) {
      const error = new Error()
      error.message = 'This action is not allow for you'
      error.status = 403
      throw error
    }
    
    fs.unlink(path.join(__dirname, '..', post.imageURL), (error) => {
      if(error)
        throw error
    })
  
    await Posts.findByIdAndDelete(id)
    

    const user = await Users.findById(req.userId)

    user.posts.pull(id)
    await user.save()

    res.status(200).json({post: post})
  } catch(error) {
    error.status ||= 500
    error.message ||= 'Something failed to deleted the post, try again, if the problem persists contact support.'
    next(error)
  }
}

module.exports.getStatus = async(req, res, next) => {
  try {
    const user = await Users.findById(req.userId)

    res.status(200).json({
      status: user.status
    })
  } catch(error) {
    error.status ||= 500
    error.message ||= 'Something failed, try again, if the problem persists contact support.'
    next(error)
  }
}

module.exports.updateStatus = async(req, res, next) => {
  try {
    const user = await Users.findById(req.userId)
    const { status } = req.body

    const errors = validationResult(req)

    if(!errors.isEmpty()) {
      const error = new Error()
      error.message = errors.array()[0].msg
      error.status = 422
      throw error
    }

    user.status = status
    await user.save()

    res.status(200).json()

    
  } catch(error) {
    error.status ||= 500
    error.message ||= 'Something failed, try again, if the problem persists contact support.'
    next(error)
  }
}