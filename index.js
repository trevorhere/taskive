var express = require("express");
var bodyParser = require("body-parser");
var twilio = require('twilio');
var keys = require("./keys");
const MongoClient = require('mongodb').MongoClient
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const assert = require('assert');
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

var selectedList = {
  name: "",
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
        3. View: View items in current lists
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
    console.log(`Lists triggered: ${msgBody}`);
      var collection = db.collection(numFrom);
      // Find lists for this numbers
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

        //SEGMENT BELOW IS SEANS OLD CODE FOR FINDIND SELECTED LIST
        // else {
        //   // collection.find({selected: true}).toArray(function(err, selectedDocs) {
        //   //   if (err != null) {
        //   //     console.log(`Error: ${err}`);
        //   //     return
        //   //   }
        //
        // //    var selectedListName = null;
        // //    if (selectedDocs.length == 0) {
        // //      console.log("No selected list found");
        // //    } else if (selectedDocs.length > 1) {
        // //      console.log("More than one selected list found:");
        // //      console.log(selectedDocs);
        // //  } else {
        // //      console.log(`SelectedDocs[0].name: ${selectedDocs[0].name}`);
        //     //  selectedListName = selectedDocs[0].name;
        // //      selectedList.name = selectedDocs[0].name;
        //
        //     }

            var resBody = docs.map(function(x) {
              if (x.name == selectedList.name) { return x.name + '*';}
              else { return x.name; }
            }).join("\n");

            console.log(`ResBody: ${resBody}`);
            var resBody = 'Lists:\n' + resBody;
            parseCallBack(res, resBody);
          });
      //   }
      // });

        break;
    case "view":
        console.log(`View triggered: ${msgBody}`);


    //    var query = {name:selectedList.name};
        // add list item to selected list start

        var collection = db.collection(numFrom);

        collection.find({}).toArray(function(err, docs) {
          if (err != null) {
            console.log(`Error: ${err}`);
            return
          }

          if (docs.length == 0) {
            parseCallBack(res, "No lists found");
          }
          var resBody = [];
          docs.map(function(x) {
            if (x.name == selectedList.name) {
                x.items.map(function(x){
                  resBody.push(x);
            });

            }

          }).join("\n");

          console.log(`ResBody: ${resBody}`);
         var resBody = selectedList.name + ": \n" + resBody.join(" \n");

          parseCallBack(res, resBody);


        });



        break;
// START SELECT
    case "select":
        console.log(`Select triggered: ${msgBody}`);
        if (message.length <= 1) {
          parseCallBack(res, "Error: Add Select requires a list name");
          return
        }

        var name = message.slice(1).join(" ");
        var collection = db.collection(numFrom);
        var query = {'name':name};

        collection.find(query).toArray(function(err, docs) {
          if (err != null) {
            console.log(`Error: ${err}`);
            return
          }
        if (docs.length != 1) {
            parseCallBack(res, `No List or more than one list with that name found` );
            return;
          }


       if(name == selectedList.name){
         parseCallBack(res, `That list is already selected`);
       } else {
          selectedList.name = name;

       }

          //selectedList.updateName("test");
          console.log("selectedList.name: " + selectedList.name);
          console.log("//docs:\n");
          console.log(docs);
          //SelectedDocs[0].name = docs.name;
        //  console.log(SelectedDocs);
          console.log("\n//docs//");


          // var selectedListName = null;
          // if (selectedDocs.length == 0) {
          //   console.log("No selected list found");
          // } else if (selectedDocs.length > 1) {
          //   console.log("More than one selected list found:");
          //   console.log(selectedDocs);
          // } else {
          //   console.log(`SelectedDocs[0].name: ${selectedDocs[0].name}`);
          //   selectedListName = selectedDocs[0].name;
          // }
          //
          // var resBody = docs.map(function(x) {
          //   if (selectedListName && x.name == selectedListName) { return x.name + '*';}
          //   else { return x.name; }
          // }).join("\n");
          //
          // console.log(`ResBody: ${resBody}`);
          // var resBody = 'Lists:\n' + resBody;
          // parseCallBack(res, resBody);
        });


        break;
//END SELECT
    case "add":
        console.log(`Add triggered: ${msgBody}`);
        if (message.length <= 1) {
          parseCallBack(res, "Error: Add command requires a name");
          return
        }

        if (message[1].toLowerCase() == 'list') {
          if (message.length <= 2) {
            parseCallBack(res, "Error: Add list command requires a name");
            return
          }

          var collection = db.collection(numFrom);
          // Find lists for this numbers
          collection.find({}).toArray(function(err, docs) {
            if (err != null) {
              console.log(`Error: ${err}`);
              return
            }

            var name = message.slice(2).join(" ");
            var doc = {
              'name': name,
              items: []
            }
            //selected list by default is latest created list
            selectedList.name = name;


            db.collection(numFrom).insertOne(doc, function(err, r) {
              assert.equal(null, err);
              assert.equal(1, r.insertedCount);
              console.log(r.result);
              parseCallBack(res, `Successfully created list: ${name}`);
            });
          });
        } else {

          var item = message.slice(1).join(" ");
          var query = {name:selectedList.name};
          // add list item to selected list start

          var collection = db.collection(numFrom);



          collection.find({}).toArray(function(err, docs) {
            if (err != null) {
              console.log(`Error: ${err}`);
              return
            }

            if (docs.length == 0) {
              parseCallBack(res, "No lists found");
            }


            var newItems = null;
            docs.forEach(function(x) {
              if (x.name == selectedList.name) {
                  newItems = x.items;
                  newitems.push(item);
                  console.log(`Items: ${newItems}`);
                }
            });
            db.collection(numFrom).updateOne(query, {items:newItems}, {upsert:true, w: 1}, function(err, r) {
              assert.equal(null, err);
              assert.equal(1, r.insertedCount);
              console.log(r.result);
              var resBody = item + ' added to ' + selectedList.name;
              console.log(`ResBody: ${resBody}`);
              parseCallBack(res, resBody);
            });
          });

        //    console.log(collection.find(query));
      //      console.log(item);
          //   console.log(collection);
          // Find lists for this numbers
          // collection.find({}).toArray(function(err, docs) {
          //   if (err != null) {
          //     console.log(`Error: ${err}`);
          //     return
          //   }
          //
          //   var name = message.slice(2).join(" ");
          //   var doc = {
          //     'name': name,
          //     items: []
          //   }
          //
          //   if (docs.length == 0) {
          //     doc['selected'] = true;
          //   }
          //
          //   db.collection(numFrom).insertOne(doc, function(err, r) {
          //     assert.equal(null, err);
          //     assert.equal(1, r.insertedCount);
          //     console.log(r.result);
          //     parseCallBack(res, `Successfully created list: ${name}`);
          //   });
          // });

          //add list item END

        }
        break;
// start Remove
case "remove":
    console.log(`Remove triggered: ${msgBody}`);
    if (message.length <= 1) {
      parseCallBack(res, "Error: Remove command requires a name");
      return
    }

    if (message[1].toLowerCase() == 'list') {
      if (message.length <= 2) {
        parseCallBack(res, "Error: Remove list command requires a name");
        return
      }

      var name = message.slice(2).join(" ");

      var collection = db.collection(numFrom);
      // Find lists for this numbers
      var query = {'name':name};

      collection.find(query).toArray(function(err, docs) {
        if (err != null) {
          console.log(`Error: ${err}`);
          return
        }

        if (docs.length != 1) {
          parseCallBack(res, `No List or more than one list with that name found` );
          return;
        }
      //  console.log(docs[0].name);
        db.collection(numFrom).deleteOne(query, function(err, r) {
          assert.equal(null, err);
          assert.equal(1, r.result.n);
          console.log(r.result);
          parseCallBack(res, `Successfully deleted list: ${name}`);
        });
      });
    } else {
      var name = message.slice(1).join(" ");
    }
    break;

//end REMOVE
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
