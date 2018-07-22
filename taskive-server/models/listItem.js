const mongoose = require("mongoose");
const List = require('./list');


const listItemSchema = new mongoose.Schema({
    text: {
        type: String,
        require: true,
        maxlength: 250
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List"
    }
});

const ListItem = mongoose.model("ListItem", listItemSchema);
module.exports = ListItem;