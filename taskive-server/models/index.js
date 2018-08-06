const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;
const dotenv = require('dotenv');

dotenv.load();

let mongoUsername = process.env.MONGO_USERNAME;
let mongoPassword = process.env.MONGO_PASSWORD;

mongoose.connect(`mongodb://${mongoUsername}:${mongoPassword}@ds231501.mlab.com:31501/taskive`, {
    keepAlive: true,
    useNewUrlParser: true 
});

module.exports.List = require('./user');
module.exports.List = require('./list');
module.exports.ListItem = require('./listItem');