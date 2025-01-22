const express = require('express')
const app = express()
const taskRoute = require('./routes/task')
const mongoose = require('mongoose')
app.use(express.json())
app.use('/',taskRoute)
const dotenv = require('dotenv').config()

mongoose.connect(process.env.mongo_uri)
.then(()=>{console.log('mongo connected')})
.catch((err)=>{console.log('error '+err)})


const port = 7002
app.listen(port,()=>{
    console.log(`Task Service running on port ${port}`) 
})