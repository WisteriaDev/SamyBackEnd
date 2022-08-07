const router = require('express').Router();
const User = require('../model/User');
const Room = require('../model/Room');
const verify = require('./verifyToken');

router.get('/create', verify, async (req,res) => {
    const codepin = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const room = new Room({
        creator: req.user,
        rule: 200,
        open: true,
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

router.post('/join', verify, async (req,res) => {
    const username = await User.findOne({_id: req.user}).select('username');

    try{
        const openstatus = await Room.findOne({pin: req.body.pin}).select('open');

        if(await Room.findOne({pin: req.body.pin}).count() == 1 && openstatus.open === true) {
            await Room.updateOne(
                {pin: req.body.pin},
                { $push: {
                    players: {id: req.user._id, username: username.username, points: 0, dice:1, multiplier: 1}
                }},
            );
            res.send({'message': `Successful joining for ${req.body.pin}`});
        } else {
            res.send({'error': `Failed joining ${req.body.pin}, room closed or doesn't exist`});
        }
    } 
    catch(err){
        res.status(400).send(err);
    }
});

// router.get('/update', verify, async (req,res) => {
    
// });

module.exports = router;