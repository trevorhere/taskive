const mongoose = require('mongoose');
const ListItem = require('./listItem');

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    listItems: [{
        type: String
    }]

})


const List = mongoose.model("Message", listSchema);
module.exports = List;