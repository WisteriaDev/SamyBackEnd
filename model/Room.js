const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
    pin: {
        type: Number
    },
    creator: {
        type: String
    },
    rule: {
        type: Number
    },
    open: {
        type: Boolean
    },
    players: {
        type: Array
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', roomSchema);
