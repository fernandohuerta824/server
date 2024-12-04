const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const bodyParser = require('body-parser')
const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')


const uri = "mongodb+srv://nodejsmax:cr7eselmejorjugador@cluster0.njj8za8.mongodb.net/first-api?retryWrites=true&w=majority&appName=Cluster0";

const app = express()

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
app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)

app.use((req, res, next) => {
    const error = new Error('That endpoint does not exists')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status).json({error: error.status, message: error.message})
})

mongoose.connect(uri)
    .then(app.listen(PORT, () => console.log('Server running on port ' + PORT)))
    .catch(error => console.log(error))


