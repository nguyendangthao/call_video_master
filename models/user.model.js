var   mongoose = require('mongoose');
//const Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    avatar: {
        type: String,
    },
    listRoom: {
        type: Array
    }
});

var User = mongoose.model('User',userSchema,'users');

module.exports=User;