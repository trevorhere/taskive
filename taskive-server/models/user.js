const mongoose = require('mongoose');
const ListItem = require('./listItem');
const List = require('./list')

const userSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    lists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "List"
    }]

})


const User = mongoose.model("User", userSchema);
module.exports = User;