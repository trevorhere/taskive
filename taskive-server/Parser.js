const { 
    createList, 
    createListSMS,
    viewListsNamesSMS, 
    viewListsItemsSMS, 
    addItemSMS, 
    removeItemSMS,
    removeListSMS,
    testingDB,
    createUserSMS      
  } = require('./handlers/lists');
let List = require('./models/list');
let User = require('./models/user')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const dotenv = require('dotenv');
dotenv.load();

// let client = require('twilio')(SID, TOKEN)


let SID =  process.env.TWILIO_SID;
let TOKEN = process.env.TWILIO_TOKEN;
let SENDER =   process.env.TWILIO_SENDER;
let client = require('twilio')(SID, TOKEN)


let secondCommand = null;
let selectedList = null;


exports.Parser = (req, res, body, userNumber) => {
   switch (getCommand(body)){
       case "?":
       return helpScript;
   
       case "list":
       console.log("list hit")
       console.log('un' + userNumber)
       viewListsNamesSMS(userNumber).then(results => { sendSMS(req, res, results, userNumber)});
       return null;

       case "lists":
       console.log("list hit")
       viewListsNamesSMS(userNumber).then(results => { sendSMS(req, res, results, userNumber)});
       return null;

       case "add":
       createListSMS(secondCommand, userNumber).then(results => { sendSMS(req, res, results, userNumber)});
       return null;

       case "remove":
       removeListSMS().then(results => { sendSMS(req, res, results, userNumber)});
       return null;

       case "select":
       return selectList(secondCommand);

       case "items" || "item":
       console.log("items hit")
       viewListsItemsSMS().then(results => { sendSMS(req, res, results, userNumber)});
       return null;

       case "plus": //send list after adding an item or removing item
       console.log("plus hit");
       addItemSMS(secondCommand).then(results => { sendSMS(req, res, results, userNumber)});
       return null;

       case "minus": //send list after adding an item or removing item
       console.log("minus hit");
       removeItemSMS(secondCommand).then(results => { sendSMS(req, res, results, userNumber)});
       return null;

       case "working":
       console.log('working hit')
       //createListSMS("movies",'+15598167525');
       //testingDB(secondCommand, '+15598167525')
       //createUserSMS("Trevor", "Lane", '+15598167525');
       viewListsNamesSMS('+15598167525');
       return null;

    
       default: 
       return "No trigger detected";
   } 
}

exports.getSelectedList = () => {
    return selectedList;
}

exports.setSelectedList = (selectedList) => {
    selectList = selectedList;
}

let getCommand = (text) => {

    if(!text || text == null)
    return "error";

    let message = text.split(" ");

    if(message.length > 1)
    {
      secondCommand = message[1];
    }
   
    let command = message[0].toLowerCase();
    return command;
}

let selectList = (name) => {
    selectedList = name;
   return  "selecting: " + selectedList;
}

let viewItems = () => {
    // get list items based on current list 
    List.find({}, () => {
        if(err)
        {
            console.log(err);
            return "error finding lists";
        }
        else
        {
            console.log({name})
        }
    });
}

  let sendSMS = (req, res, body, userNumber) => {

    console.log('req: ' + req);
    console.log('body: ' + body);
   
    try {
        client.messages
        .create({
           body: body,
           from: SENDER,
           to: userNumber
         })
        .then(message => console.log(message.sid))
        .done();
    } catch (err){
        console.log("error in sendSMS: " + err);
    }

  };


let helpScript = 
" Taskive: Tasks via SMS " +
" The following commands are available: " +
"\n1. \"?\": Show this message " +
"\n2. \"list\": Show your lists (current list marked with *) " +
"\n3. \"items\": View items in current lists " +
"\n4. \"select 'name' \": Select the list by 'name' " +
"\n5. \"add 'name' \": Adds 'name' as an item to current list " +
"\n6. \"add list 'name' \": Adds 'name' as a new list " +
"\n7. \"remove 'name' \": Removes 'name' as an item from current list " +
"\n8. \"remove list 'name' \": Removes list 'name', will confirm if not empty ";

