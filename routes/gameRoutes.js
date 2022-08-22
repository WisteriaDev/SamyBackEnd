const router = require('express').Router();
const User = require('../model/User');
const Room = require('../model/Room');
const verify = require('./verifyToken');
const rules = require('../rules.json');
rules.toString;

router.get('/create', verify, async (req,res) => {
    //generate pin
    const codepin = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const room = new Room({
        creator: req.user,
        rule: 200,
        open: true,
        pin: codepin,
        players: [],
        winner: null
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
        //check if the room is open
        const openstatus = await Room.findOne({pin: req.body.pin}).select('open');
        // if the room exist, push the user in the room
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

router.get('/leave', verify, async (req,res) => {
    try{
        //get room pin and admin id in the document
        var roomcode = await Room.findOne({'players.id': req.user._id}).select('pin');
        var adminID = await Room.findOne({'players.id': req.user._id}).select('creator');
        //if req user is admin, delete room. Else, remove user from room
        if(req.user._id == adminID.creator){
            await Room.deleteMany({creator: req.user._id});
            res.send({'message': 'Successful deletion for room ' + roomcode.pin});
        } else {
            await Room.updateOne(
                {'players.id': req.user._id},
                { $pull: {
                    players: 
                        {
                            id: req.user._id,
                        }
                    }
                },
            );
            res.send({'message': 'Successful leaving for room ' + roomcode.pin + ' for user ' + req.user.username});
        }
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.get('/info', verify, async (req,res) => {
    try{
        // select all the document and send
        await Room.findOne({'players.id': req.user._id}).select('_id pin creator rule open players date winner').exec(function (err, room) {
            if (err) return res.status(400).send(err);
            res.send(room);
        });
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.post('/setRule', verify, async (req,res) => {
    try{
        var roomcode = await Room.findOne({'players.id': req.user._id}).select('pin');
        var adminID = await Room.findOne({'players.id': req.user._id}).select('creator');
        // check if user is admin, if true, set rule
        if(req.user._id == adminID.creator){
            await Room.updateOne(
                {creator: req.user._id},
                { $set: {
                    rule: req.body.rule
                    }
                },
            );
            res.send({'message': 'Successful set new rule ' + req.body.rule + ' for room ' + roomcode.pin});
        } else {
            res.send({'error': 'You are not the admin of this room'});
        }
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.post('/newEntry', verify, async (req,res) => {
    try{
        //get array of the user and set variables
        await Room.findOne({'players.id': req.user._id}).select('players.$').exec(async function(err, myDoc) {
            if (err) return res.status(400).send(err);
            var multiplier = myDoc.players[0].multiplier;
            var username = myDoc.players[0].username;      

            //increment new throw with id times multiplier variable
            await Room.updateOne({'players.id': req.user._id}, {$inc: {"players.$.points" : req.body.entry*multiplier}});
            res.send('Adding '+ req.body.entry + ' with multiplier ' + multiplier + ' (' + req.body.entry*multiplier + ')' + ' to ' + req.user._id + ' (' + username + ')');

            //then check if the user has won, True: set winner
            await Room.findOne({'players.id': req.user._id}).select('players.$').exec(async function(err, myDoc) {
                if (err) return res.status(400).send(err);
                var points = myDoc.players[0].points;
                var rule = await Room.findOne({'players.id': req.user._id}).select('rule');
                
                if(points >= rule.rule){
                    await Room.updateOne({'players.id': req.user._id}, {$set: {"winner" : username}});
                }
            });
        });
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.get('/addDice', verify, async (req,res) => {
    try{
        //get array of the user and set variables
        await Room.findOne({'players.id': req.user._id}).select('players.$').exec(async function(err, myDoc) {
            if (err) return res.status(400).send(err);
            var dice = myDoc.players[0].dice;
            var points = myDoc.players[0].points;
            var username = myDoc.players[0].username; 

            //check if the user has reach max dice
            if(dice < 5){
                //check if the user has enough points to buy a dice
                if(points >= rules.dice[dice].price){
                    await Room.updateOne({'players.id': req.user._id}, {$inc: {"players.$.dice" : 1}});
                    await Room.updateOne({'players.id': req.user._id}, {$inc: {"players.$.points" : -rules.dice[dice].price}});
                    res.send('Adding 1 dice to ' + req.user._id + ' (' + username + ')');
                } else {
                    res.send('Not enough points to buy a dice');
                }
            } else {
                res.send('Max dice reached');
            }
        });
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.get('/addMultiplier', verify, async (req,res) => {
    try{
        //get array of the user and set variables
        await Room.findOne({'players.id': req.user._id}).select('players.$').exec(async function(err, myDoc) {
            if (err) return res.status(400).send(err);
            var multiplier = myDoc.players[0].multiplier;
            var points = myDoc.players[0].points;
            var username = myDoc.players[0].username; 

            //check if the user has reach max multiplier
            if(multiplier < 4) {
                //check if the user has enough points to buy a multiplier
                if(points >= rules.multiplier[multiplier].price){
                    await Room.updateOne({'players.id': req.user._id}, {$inc: {"players.$.multiplier" : 1}});
                    await Room.updateOne({'players.id': req.user._id}, {$inc: {"players.$.points" : -rules.multiplier[multiplier].price}});
                    res.send('Adding 1 multiplier to ' + req.user._id + ' (' + username + ')');
                } else {
                    res.send('Not enough points to buy a multiplier');
                }
            } else {
                res.send('Max multiplier reached');
            }

            
        });
    }
    catch(err){
        res.status(400).send(err);
    }
});

module.exports = router;