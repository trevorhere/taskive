const mongoose = require('mongoose');
const ListItem = require('./listItem');
const List = require('./list')

const userSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        unique: true
    },
    lastName: {
        type: String,
        required: true,
        unique: true
    },
    lists: [{
            listName: {
                type: String,
                unique: true
            },
            listItems: [{
                type: String,
                unique: true
            }]
    }]

})


const User = mongoose.model("User", userSchema);
module.exports = User;