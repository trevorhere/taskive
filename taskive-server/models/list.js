const mongoose = require('mongoose');
const ListItem = require('./listItem');

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    listItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ListItem'
    }]

})


const List = mongoose.model("Message", listSchema);
module.exports = List;