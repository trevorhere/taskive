const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    owner: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    listName: {
        type: String,
        required: true,
        unique: true
    },
    listItems: [{
        type: String
    }]

})


const List = mongoose.model("List", listSchema);
module.exports = List;