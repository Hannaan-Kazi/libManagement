const express = require("express")
const user = require("./controller/uControl")
const book=require('./controller/bControl')

const app = express()
app.use(express.json())
app.use('/',user.router)
app.use('/',book.router)
app.use(express.urlencoded({ extended: true }))






app.listen(3000, () => console.log("On port 3000..."))