const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
    firstname:{
        type: String,
        default: ''
    },
    lastname:{
        type: String,
        default: ''
    },
    googleId: String,
    image:{
        type: String,
        default: ' '
    },
    email:{
        type: String,
        default: ' '
    }
},{
    timestamps:true
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',User);