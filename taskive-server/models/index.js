const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;
const dotenv = require('dotenv');

dotenv.load();

let mongoUsername = process.env.MONGO_USERNAME;
let mongoPassword = process.env.MONGO_PASSWORD;
let mongoToken = process.env.MONGO_TOKEN

mongoose.connect(mongoToken, {
    keepAlive: true,
    useNewUrlParser: true 
});

module.exports.User = require('./user');
module.exports.List = require('./list');