const express = require('express')
const bodyParser = require('body-parser')
const feedRoutes = require('./routes/feed')

const app = express()

const PORT = process.env.PORT || 8080

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/feed', feedRoutes)

app.listen(PORT, () => console.log('Server running on port ' + PORT))
