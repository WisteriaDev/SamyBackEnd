const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
    pin: {
        type: Number
    },
    creator: {
        type: String
    },
    players: {
        type: Array
    },
    rule: {
        type: Number
    },
    open: {
        type: Boolean
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', roomSchema);
