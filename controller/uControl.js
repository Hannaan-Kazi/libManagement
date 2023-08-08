const { uValidate, passValidate } = require("../middlewares/joi");
const { authz, tokVerify } = require("../middlewares/token");
const {  gU, showAllU, upU, delU, regU, login, delAll, regAd, refresh } = require("../model/umodel");

const express = require("express")
const router = express.Router()

router.get('/all', async (req, res) => {
    let a = await showAllU()
    res.json(a)
})

//search By Name
router.get('/showU', async (req, res) => {
    let a = await gU(req.body)
    res.json(a)
})

router.put('/upUser',tokVerify, async (req, res) => {
    let a = await upU(req.body)
    res.json(a)
})

// router.post('/addU', async (req, res) => {
//     let a = await addU(req.body)
//     res.json(a)
// })
router.post('/regAd',authz, async (req, res) => {
    let a = await regAd(req.body)
    res.json(a)
})

router.post('/register',uValidate, async (req, res) => {
    let a = await regU(req.body)
    res.json(a)
})


router.post('/login', async (req, res) => {
    let a = await login(req.body)
    res.json(a)
});

router.delete('/delete',tokVerify, async (req, res) => {
    let a = await delU(req.body)
    res.json(a)
});
router.delete('/delAll', async (req, res) => {
    let a = await delAll(req.body)
    res.json(a)
});

router.post('/ref',tokVerify,async(req,res)=>{
    let a=await refresh(req.headers)
    res.send(a)
})
module.exports = {
    router
}