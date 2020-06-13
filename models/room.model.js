var   mongoose = require('mongoose');
//const Schema = mongoose.Schema;

var roomSchema = new mongoose.Schema({
    name: String,
    //code: String,
    members: {
        type: Array
    },
    messages: {
        type: Array
    },
    create: {
        type: Date,
        default: Date.now()
    },
    avatar: {
        type: String,
        default: "none"
    }
});

var Room= mongoose.model('Room',roomSchema,'rooms');

module.exports=Room;