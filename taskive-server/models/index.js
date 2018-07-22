const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;

mongoose.connect("mongodb://taskiveAdmin:Sh3lby9116!@ds231501.mlab.com:31501/taskive", {
    keepAlive: true,
    useNewUrlParser: true 
});


module.exports.List = require('./list');
module.exports.ListItem = require('./listItem');