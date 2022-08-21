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
        pin: codepin,
        players: []
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
        const a = req.user+"";



        if(await Room.findOne({pin: req.body.pin}).count() == 1 && openstatus.open === true) {
            await Room.updateOne(
                {pin: req.body.pin},
                { $push: {
                    players: 
                        {
                            id: req.user._id,
                            username: username.username,
                            points: 0,
                            dice: 1,
                            multiplier: 1

                        }
                    }
                },
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

router.get('/info', verify, async (req,res) => {
    try{
        //await Room.findOne({'players.id': req.user._id}).select('_id pin creator rule open players date').exec(function (err, room) {
        await Room.findOne({}).select('_id pin creator rule open players date').exec(function (err, room) {
            if (err) return res.status(400).send(err);
            res.send(room);
        });
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.post('/newEntry', verify, async (req,res) => {
    try{
        //eror recup first player of the room
        await Room.findOne({'players.id': req.user._id}).select('players').exec(async function(err, myDoc) {
            if (err) return res.status(400).send(err);
            var multiplier = myDoc.players[0].multiplier;
            console.log(multiplier);

            //increment new throw with id times multiplier variable
            await Room.updateOne({'players.id': req.user._id}, {$inc: {"players.$.points" : req.body.entry*multiplier}});
            res.send('succes');
        });
    }
    catch(err){
        res.status(400).send(err);
    }
});

module.exports = router;




// router.post('/join', verify, async (req,res) => {
//     const username = await User.findOne({_id: req.user}).select('username');

//     try{
//         const openstatus = await Room.findOne({pin: req.body.pin}).select('open');

//         if(await Room.findOne({pin: req.body.pin}).count() == 1 && openstatus.open === true) {
//             await Room.updateOne(
//                 {pin: req.body.pin},
//                 { $push: {
//                     players: {id: req.user._id, username: username.username, points: 0, dice:1, multiplier: 1}
//                 }},
//             );
//             res.send({'message': `Successful joining for ${req.body.pin}`});
//         } else {
//             res.send({'error': `Failed joining ${req.body.pin}, room closed or doesn't exist`});
//         }
//     } 
//     catch(err){
//         res.status(400).send(err);
//     }
// });