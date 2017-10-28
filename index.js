var express = require("express");
var bodyParser = require("body-parser");
var twilio = require('twilio');
var keys = require("./keys");

const MessagingResponse = require('twilio').twiml.MessagingResponse;
var app = express();

app.use(bodyParser.urlencoded({extended:false}));

// Twilio Credentials
var accountSid = keys['accountSid'];
var authToken = keys['authToken'];

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

app.set('port', process.env.PORT || 8080);
console.log(process.env.PORT);

//TEST FUNCTIONS
function sayHello(){
  console.log("hello");
}



//TEST FUNCTIONS
function sendText(){
  client.messages.create({
      body: 'Greetings! The current time is: 20:03 MST IPV5EL1VGWFMLDS',
      to: '+5598167525',  // Text this number
      from: '+13852904244' // From a valid Twilio number

  });
}


//INDEX ROUTE
app.get('/', function(req, res){
        res.send('hello world');
        sayHello();
        sendText();
        sayHello();
});


//RECIEVE MESSAGE
app.post('/message', (req, res) => {

  // Start our TwiML response.
  const twiml = new MessagingResponse();

  console.log("Req");
  console.log(req);
  console.log(req.body);

  var msgBody = req.body.Body;
  console.log(msgBody);
  // Add a text message.
  const msg = twiml.message('What is up dude?');//

  // Add a picture message.
  msg.media('https://www.softpaws.com/template/images/landing_page/july_cat_image.jpg');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});


var db;

MongoClient.connect('mongodb://dbuser:rG4y8br#k^F25W7gFfnXcKaUYZhsR@ds237855.mlab.com:37855/taskivedb', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(app.get('port'), function(){
    console.log("app is running on: " + app.get('port'))
  })
});



