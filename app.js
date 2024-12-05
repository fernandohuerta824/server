const express = require('express')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const graphqlHttp = require('graphql-http/lib/use/express')
const { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser')

const graphqlSchema = require('./graphql/schema')
const graphqlResolver= require('./graphql/resolvers')
const auth = require('./middlewares/auth')


const uri = "mongodb+srv://nodejsmax:cr7eselmejorjugador@cluster0.njj8za8.mongodb.net/first-api?retryWrites=true&w=majority&appName=Cluster0";


const app = express()
const server = http.createServer(app)

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif' || file.mimetype === 'image/webp' || file.mimetype === 'image/svg' || file.mimetype === 'image/avif' || file.mimetype === 'image/jfif') 
        cb(null, true)
    else
        cb(null, false)
}

const PORT = process.env.PORT || 8080

app.use(cors({
    origin: 'http://192.168.100.188:3000',
    methods: 'GET, POST, PUT, PATCH, DELETE',
}))

app.use(multer({storage: fileStorage, fileFilter}).single('image'))
app.use(bodyParser.json())
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(auth)

app.put('/post-image', (req, res, next) => {
    if(!req.isAuth) {
        const error = new Error()
        error.message = 'Not authorized'
        error.status = 401
        throw error
    }
    if(!req.file) 
        return res.status(200).json({message: 'No file provided'})
    if(req.body.oldPath) 
        clearImage(req.body.oldPath)

    return res.status(201).json({ message: 'File stored', filePath:  req.file.path.replace('\\', '/')})
})


app.use('/graphql', (req, res) => {
    graphqlHttp.createHandler({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        formatError(error) {
            if(error.originalError) 
               return {...error.originalError}
            
            return error
        },
        context: { req}
    })(req, res)
})




// app.use((req, res, next) => {
//     const error = new Error('That endpoint does not exists')
//     error.status = 404
//     next(error)
// })




mongoose.connect(uri)
    .then(result => {
        server.listen(PORT, () => console.log('Server running on port ' + PORT)) 
    })
    .catch(error => console.log(error))

const clearImage = filePath => {
    fs.unlink(path.join(__dirname, filePath), (error) => {
        if(error)
          throw error
      })
}

