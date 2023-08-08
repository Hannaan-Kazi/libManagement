const express=require('express')

const { addB, gB, delB, delAllB, upB, showall, booking, iShowall, retBook } = require('../model/bmodel')

const router=express.Router()

router.post('/addBook',async (req,res)=>{
    let a= await addB(req.body)
    res.json(a)
})
router.post('/booking',async (req,res)=>{
    let a= await booking(req)
    res.json(a)
})
router.post('/return',async (req,res)=>{
    let a= await retBook(req.body)
    res.json(a)
})
router.get('/getBook',async (req,res)=>{
    let a= await gB(req.body)
    res.json(a)
})
router.get('/allBook',async (req,res)=>{
    let a= await showall(req.body)
    res.json(a)
})
router.get('/iAllBook',async (req,res)=>{
    let a= await iShowall(req.body)
    res.json(a)
})
router.put('/upBook',async (req,res)=>{
    let a= await upB(req.body)
    res.json(a)
})
router.delete('/delBook',async (req,res)=>{
    let a= await delB(req.body)
    res.json(a)
})
router.delete('/delAllBook',async (req,res)=>{
    let a= await delAllB(req.body)
    res.json(a)
})

module.exports={router}