const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const {registerValidation} = require('../validation');

router.get('/new', verify, async (req,res) => {
    try{
        const user = await User.findOne({_id: req.user});
        res.send(user);
    } 
    catch(err){
        res.status(400).send(err);
    }
});


module.exports = router;