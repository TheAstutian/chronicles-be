//Access MongoDB database
require ('./db');


const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = require('express')();
const port = process.env.PORT || 5000; 

app.use(cors())
app.use(cookieParser())

var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())


//Config to accept post form data  


//app.use('/user', UserRouter)
const UserRoutes = require('./routes');
app.use('/', UserRoutes)
 

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})