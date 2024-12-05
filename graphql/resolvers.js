const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
const validator = require('validator')
const { Types } = require('mongoose')
const Users = require('./../model/User')
const Posts = require('./../model/Posts')
const bcrypt = require('bcryptjs')
const User = require('./../model/User')


const isAuth = band => {
    if(!band) {
        const error = new Error()
        error.message = 'Not authorized'
        error.status = 401
        throw error
    }
}

module.exports = {
    async createUser(args) {
        const { email, name, password } = args.userInput
        const errors = []
        if(!validator.isEmail(email))
            errors.push({message: 'Email is invalid'})
        if(validator.isEmpty(password) || !validator.isLength(password, {min: 5}))
            errors.push({message: 'Password too short'})
        if(errors.length > 0) {
            const error = new Error()
            error.message = 'Invalid Input'
            error.data = errors
            error.status = 422
            throw error
        }

        const existingUser = await Users.findOne({ email })

        if(existingUser) {
            const error = new Error()
            error.message = 'User exists already'
            error.data = errors
            error.status = 422
            throw error
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = new Users({
            email,
            name,
            password: hashedPassword
        })

        const createdUser = await user.save()

        return {
            ...createdUser._doc, _id: createdUser._id.toString()
        }
    },

    async login({ email, password }) {
        const user = await Users.findOne({email})

        if(!user) {
            const error = new Error()
            error.message = 'User not found'
            error.status = 401
            throw error
        }

        const isAuth = await bcrypt.compare(password, user.password)

        if(!isAuth) {
            const error = new Error()
            error.message = 'Incorrect Password'
            error.status = 401
            throw error
        }

        const jwtToken = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'somesupersecretsecretprivatekey', { expiresIn: '1h' })

        return { token: jwtToken, userId:  user._id.toString()}
    },

    async createPost(args, { req }) {
        isAuth(req.isAuth)
        const { title, content, imageURL } = args.postInput
        const errors = []

        if(validator.isEmpty(title.trim()) || !validator.isLength(title.trim(), { min:5 })) 
            errors.push({message: 'Title must almost 5 characters long'})
        if(validator.isEmpty(content.trim()) || !validator.isLength(content.trim(), { min:5 })) 
            errors.push({message: 'Content must almost 5 characters long'})
        
        if(errors.length > 0) {
            const error = new Error()
            error.message = 'Invalid Input'
            error.data = errors
            error.status = 422
            throw error
        }

        const user = await User.findById(req.userId)


        if(!user) {
            const error = new Error()
            error.message = 'Not authorized'
            error.status = 401
            throw error
        }

        const post = new Posts({
            title,
            content,
            imageURL,
            creator: user
        })

        const createdPost = await post.save()
        user.posts.push(post)
        await user.save()
        return {...createdPost._doc, _id: createdPost._id.toString(), createdAt: createdPost.createdAt.toISOString(), updateAt: createdPost.updatedAt.toISOString()}
    },

    async postData({ page }, { req }) {
        isAuth(req.isAuth)
        //La fecha viene en segundos desde 1970
        const queryPage = parseInt(page);
        const totalItems = await Posts.countDocuments()
        const limit = 2;
        const totalPages = Math.ceil(totalItems / limit)
        const currentPage = queryPage < 1 || !Number.isFinite(queryPage) ? 1 : queryPage > totalPages ? totalPages : queryPage || 1
        const skip = (currentPage - 1) * limit
        const posts = await Posts.find().populate('creator').skip(skip < 0 ? 0 :  skip).limit(limit).sort({createdAt: -1});


        return {posts, totalItems}
    },

    async post({ postId }, { req }) {
        isAuth(req.isAuth)
        if(!Types.ObjectId.isValid(postId)) {
            const error = new Error()
            error.message = 'Post not found'
            error.status = 404
            throw error
        }

        const post = await Posts.findById(postId).populate('creator')

        if(!post) {
            const error = new Error()
            error.message = 'Post not found'
            error.status = 404
            throw error
        }

        return {...post._doc, _id: post._id.toString()}
    },

    async updatePost({ postId, postInput }, { req }) {
        isAuth(req.isAuth)
        const errors = []

        if(validator.isEmpty(postInput.title.trim()) || !validator.isLength(postInput.title.trim(), { min:5 })) 
            errors.push({message: 'Title must almost 5 characters long'})
        if(validator.isEmpty(postInput.content.trim()) || !validator.isLength(postInput.content.trim(), { min:5 })) 
            errors.push({message: 'Content must almost 5 characters long'})
        
        if(errors.length > 0) {
            const error = new Error()
            error.message = 'Invalid Input'
            error.data = errors
            error.status = 422
            throw error
        }
        const post = await Posts.findById(postId).populate('creator')

        if(!post || post.creator._id.toString() !== req.userId) {
            const error = new Error()
            error.message = 'Post not found'
            error.status = 404
            throw error
        }

        post.title = postInput.title
        post.content = postInput.content
        if(postInput.imageURL !== 'undefined')
            post.imageURL = postInput.imageURL

        const updatedPost = await post.save()

        return {...updatedPost._doc, _id: updatedPost._id.toString()}

    },

    async deletePost({ postId }, { req }) {
        isAuth(req.isAuth)

        if(!Types.ObjectId.isValid(postId)) {
            const error = new Error()
            error.message = 'Post not found'
            error.status = 404
            throw error
        }

        const post = await Posts.findById(postId).populate('creator')

        if(!post || post.creator._id.toString() !== req.userId) {
            const error = new Error()
            error.message = 'Post not found'
            error.status = 404
            throw error
        }
        
        const user = await Users.findById(req.userId)
        if(!user) {
            const error = new Error()
            error.message = 'Not authorized'
            error.status = 401
            throw error
        }
        const deletedPost = await Posts.findByIdAndDelete(postId)

        user.posts.pull(postId)
        await user.save()
        console.log(path.join(__dirname, '..', deletedPost.imageURL))
        fs.unlink(path.join(__dirname, '..', deletedPost.imageURL), (error) => {
            if(error)
              throw error
        })

        return {...deletedPost, _id: deletedPost._id}
    },

    async status(args, { req }) {
        isAuth(req.isAuth)
        const user = await Users.findById(req.userId, {status: 1})
        if(!user) {
            const error = new Error()
            error.message = 'Not authorized'
            error.status = 401
            throw error
        }

        return user.status
    },

    async updateStatus({ status }, { req }) {
        isAuth(req.isAuth)

        const user = await Users.findById(req.userId)
        if(!user) {
            const error = new Error()
            error.message = 'Not authorized'
            error.status = 401
            throw error
        }

        user.status = status
        await user.save()
        return true
    }
}
