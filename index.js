var express = require("express");
var bodyParser = require("body-parser");
var twilio = require('twilio');
var keys = require("./keys");
const MongoClient = require('mongodb').MongoClient
const MessagingResponse = require('twilio').twiml.MessagingResponse;
var app = express();

app.use(bodyParser.urlencoded({extended:false}));

// Twilio Credentials
var accountSid = keys['accountSid'];
var authToken = keys['authToken'];

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

app.set('port', process.env.PORT || 8080);

//TEST FUNCTIONS
function sayHello(){
  console.log("hello");
}

function sendErrorMessage(){
    return "Sorry, we don\'t recognize that command. Send \"COMMANDS\" to view default commands";
};

function parseMessage(msgBody, numFrom, res){
   var message = msgBody.split(" ");
   var keyCommand = message[0].toLowerCase();

   switch(keyCommand) {
    case "commands":
        console.log(`Commands triggered: ${msgBody}`);
        var val = `Taskive: Tasks via SMS
        The following commands are available:
        1. HELP: Show this message
        2. LISTS: Show your lists (current list marked with *)
        3. SHOW: Show items in current lists
        4. SELECT [0]: Select the list named by [0]
        5. ADD [0]: Adds [0] as an item to current list
        6. ADD LIST [0]: Adds [0] as a new list
        7. REMOVE [0]: Removes [0] as an item from current list
        8. REMOVE LIST [0]: Removes list [0], will confirm if not empty
        9. COMPLETE [0]: Marks [0] as a completed item on the current list
        `;
        parseCallBack(res, val);
        break;
    case "lists":
      var collection = db.collection('documents');
      // Find some documents
      collection.find({}).toArray(function(err, docs) {
        if (err != null) {
          console.log(`Error: ${err}`);
          return
        }
        console.log("Found the following records");
        console.log(docs)
        if (docs.length == 0) {
          parseCallBack(res, "No lists found");
        }
        else {
          parseCallBack(res, docs.toString());
        }
      });
        console.log(`Lists triggered: ${msgBody}`);
        break;
    case "show":
        console.log(`Show triggered: ${msgBody}`);
        break;
    case "select":
        console.log(`Select triggered: ${msgBody}`);
        break;
    case "add":
        console.log(`Add triggered: ${msgBody}`);
        break;
    case "remove":
        console.log(`Remove triggered: ${msgBody}`);
        break;
    case "complete":
        console.log(`Complete triggered: ${msgBody}`);
        break;
    default:
      console.log(`None triggered: ${msgBody}`);
      parseCallBack(res, sendErrorMessage());
  };
};

function parseCallBack(res, resBody) {
  // Add a text message.
  const twiml = new MessagingResponse();
  const msg = twiml.message(resBody);//

  // Add a picture message.
  //  msg.media('https://www.softpaws.com/template/images/landing_page/july_cat_image.jpg');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
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



//RECEIVE MESSAGE
app.post('/message', (req, res) => {

  // Start our TwiML response.
  var msgBody = req.body.Body;
  var fromNumber = req.body.From;
  parseMessage(msgBody, fromNumber, res);
});

var db;

MongoClient.connect(
    `mongodb://${keys['mdb-user']}:${keys['mdb-pass']}\@ds237855.mlab.com:37855/taskivedb`, 
    (err, database) => 
{
  if (err) return console.log(err)
  db = database
  app.listen(app.get('port'), function(){
    console.log("app is running on: " + app.get('port'))
  })
});

