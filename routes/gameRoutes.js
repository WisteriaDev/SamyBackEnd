const router = require('express').Router();
const Room = require('../model/Room');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');
const {registerValidation} = require('../validation');

router.get('/newRoom', verify, async (req,res) => {
    const codepin = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const room = new Room({
        creator: req.user,
        rule: 200,
        state: open,
        pin: codepin
    });

    try{
        console.log(room);
        await room.save();

        res.send({'pin': codepin});
    }
    catch(err){
        res.status(400).send(err);
    }
});


module.exports = router;