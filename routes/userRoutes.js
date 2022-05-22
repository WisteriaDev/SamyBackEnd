const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const {registerValidation} = require('../validation');
const { updateOne } = require('../model/User');

router.post('/register', async (req,res) => {
    //validation
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = new User({
        username: req.body.username
    });
    try{
        const savedUser = await user.save();
        //create and assign a token
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
        res.header('auth-token', token).send(savedUser);
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.post('/rename', verify, async (req,res) => {
    //validation
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try{
        await User.updateOne(
            {_id: req.user},
            { $set: {username: req.body.username}},
        );
        res.send({'message': `Successful renaming for ${req.body.username}`});
    } 
    catch(err){
        res.status(400).send(err);
    }
});

router.get('/delete', verify, async (req,res) => {
    try{
        await User.deleteOne({_id: req.user});
        res.send({'message': 'User deleted successfully'});
    } 
    catch(err){
        res.status(400).send(err);
    }
});

module.exports = router;