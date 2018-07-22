const db = require('../models');
const MessagingResponse = require('twilio').twiml.MessagingResponse;



exports.createList = async function(req,res,next){
    try 
    {
        let list = await db.List.create({
            name: req.body.name
        });
     return res.status(200)
    }
    catch (err)
    {
        return next(err);
    }
}

exports.createListSMS = async (name) => {
   
    try 
    {
        let list = await db.List.create({
            name: name
        });
     return res.status(200)
    }
    catch (err)
    {
        console.log(`error at createListsSMS: ${err}`)
        return next(err);
    }
}

exports.viewListsNamesSMS = async () => {

     console.log("view lists names hit");

     let formatResult = (messages) => {
        let temp = [];
        for(let i = 0; i < messages.length; i ++)
            {
                temp.push(messages[i].name.toString());
            }
            return "Lists: \n" + temp.join('\n');
    }

 async function getListNames() {
        const result = await db.List.find(); 
        console.log("result: " + result)
        return result;
    }

let final = formatResult( await getListNames());
console.log('final: ' + final);
return final;

}