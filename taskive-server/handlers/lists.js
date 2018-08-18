const db = require('../models');
const User = require('../models/user')
const List = require('../models/list')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { getSelectedList , setSelectedList } = require('../Parser')
const  Parser = require('../Parser');

exports.testingDB = async (name, from) => { 
    try {
        console.log('from: ' + from);
        //let user = await getUserFromDB(from);
        //console.log('user: ' + user);
        const result = await User.find();
        console.log('result: ' + result);
    } 
    catch(err)
    {
      console.log('err in testingDB: ' + err);
    }
}

exports.createUserSMS = async (firstName, lastName, from) => { // WORKING
    console.log('firstname: ' +firstName);
    console.log(`lastName ${lastName}`)
    console.log(`from ${from}`)
   
    try 
    {
      User.create({
            firstName: firstName,
            lastName: lastName,
            number: from
        });

     return firstName + ' added.'
    }
    catch (err)
    {
        console.log(`error at createUsercanSMS: ${err}`)
        return 'error adding ' + firstName;
    }
}

exports.selectListSMS = async (from, name) => {
    let user = await getUserFromDB(from);
    if(user == null)
    {
     return 'error finding account';
    }

    for(let i = 0; i < user.lists.length; i++)
    { 
     console.log('user.lists[' + i + ']: ' + user.lists[i]);
     let list = await List.findById(user.lists[i]);
     if(list)
     {
        if(list && list.listName == name)
        {
           Parser.setSelectedList(name);
           return name + ' selected';
        } 
     }
    }

    return name + ' not found.'
}

exports.createListSMS = async (name, userNumber) => { // WORKING
    try 
    {
        let result = null;
        let userID = await getUserIDFromDB(userNumber);
        console.log('userID: ' + userID);
        User.findById(userID, (err, user) => {
            if(err)
            {
                console.log('error: ' + err);
                result = 'error adding ' + name;
            }
            else
            {
                let list = { listName: name};
                List.create(list, (err, list) => {
                    if(err)
                    {
                        console.log(err);
                        result = 'error adding ' + name;
                    }
                    else
                    {
                        list.owner.id = userID;
                        list.save();
                        user.lists.push(list);
                        user.save();
                        console.log(list);
                        
                    }
                });

               
            }
        });

         if(!result) 
         {
             console.log('result: ' + result);
             return name + ' added.'
         }
         else
         {
            return result;
         }
    }
    catch (err)
    {
        console.log(`error at createListsSMS: ${err}`)
        return 'error adding ' + name;
    }
}

exports.removeListSMS = async (userNumber) => { // WORKING
   let selectedList =  Parser.getSelectedList();
   if(selectedList == null)
   {
       return "please select a list before removing it"
   }
   else
   {

    try 
    {   
        let user = await getUserFromDB(userNumber);
        let userID = user._id;
        if(!user)
        {
            return 'error finding account';
        }

        let listID =  null; //await getListIDFromUser(user, selectedList);

        for(let i = 0; i < user.lists.length; i++)
        {
            console.log('user.lists[' + i + ']: ' + user.lists[i]);
            let list = await List.findById(user.lists[i]);
           // console.log(list.listName);
            if(list && list.listName == selectedList)
            {
                 listID = list._id;
                 List.findByIdAndRemove(listID, (err)=>{
                    if(err)
                    {
                        throw err;
                    }
                });
        

            } 
        }

       User.findByIdAndUpdate(userID,
            {$pull: {lists: listID}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err){
                console.log('err: ' + err);
                }else{
                //do stuff
                console.log('doc: ' + doc );
                }
            }
        );
        

        Parser.setSelectedList(null);
        return selectedList + " removed.";


    }
    catch (err)
    {
        console.log(`error at removeListsSMS: ${err}`)
        return 'error removing list';
    }
}

}

exports.viewListsNamesSMS = async (userNumber) => { // WORKING
    let selectedList =  Parser.getSelectedList();
    try 
    {
        console.log("view lists names hit");
        let user = await getUserFromDB(userNumber);
        if(user == null)
        {
         return 'error finding account';
        }

        let temp = [];

     for(let i = 0; i < user.lists.length; i++)
     { 
      console.log('user.lists[' + i + ']: ' + user.lists[i]);
      let list = await List.findById(user.lists[i]);
      if(list)
      {
                if(selectedList != null && selectedList == list.listName)
                 {
                     temp.push(list.listName + " *");
                 }
                 else
                 {
                    temp.push(list.listName);
                 }
      } 
  }

  let final =  "Lists: \n" + temp.join('\n');
  console.log('final: ' + final);
  return final;

} 
catch (err)
{
    console.log('error in viewListNamesSMS: ' + err);
    return 'error view lists';
}

    
}

exports.addItemSMS = async (userNumber, item) => { // WORKING
    console.log('add item hit');
    let selectedList = Parser.getSelectedList();
    console.log('selectedList: ' + selectedList);
    if(selectedList == null)
    {
        return "please select a list before adding list items"
    }
    else
    {  
        try
        {
            let user = await getUserFromDB(userNumber);
            let userID = user._id;
            if(!user)
            {
                return 'error finding account';
            }

            let listID = null;

            for(let i = 0; i < user.lists.length; i++)
            {
                //console.log('user.lists[' + i + ']: ' + user.lists[i]);
                let list = await List.findById(user.lists[i]);
                if(list && list.listName.toString() == selectedList)
                {
                     listID = list._id;
                     selectedList = list; 
                } 
            }

       if(listID)
       {

        List.findByIdAndUpdate(listID,
            {$push: {listItems: item}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err)
                {
                console.log(err);
                return 'error adding ' + item;
                }
                else
                {
                 return item + " added.";
                }
            }
        );
        } 
        else
        {

            return 'error adding ' + item;
        }
        
        return item + " added.";
        } 
        catch (err)
        {
            console.log('error in addItemSMS ' + err);
            return 'error adding ' + item;

        }  
    }
}

exports.removeItemSMS = async (userNumber, item) => {  //WORKING
    let selectedList = Parser.getSelectedList();
    console.log('selectedList: ' + selectedList);
    if(selectedList == null)
    {
        return "please select a list before removing list items"
    }
    else
    {  
        try
        {
            let user = await getUserFromDB(userNumber);
            let userID = user._id;
            if(!user)
            {
                return 'error finding account';
            }

            let listID = null;

            for(let i = 0; i < user.lists.length; i++)
            {
                let list = await List.findById(user.lists[i]);
                if(list)
                {
                    console.log('listName: ' + list.listName);
                    console.log('selectedlist: ' + selectedList);
                }
                if(list && list.listName.toString() == selectedList)
                {
                     listID = list._id;
                     selectedList = list; 
                } 
            }

            console.log('listID: ' + selectedList._id);      
       if(listID)
       {
           console.log('listID: ' + listID);

        List.findByIdAndUpdate(listID,
            {$pull: {listItems: item}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err)
                {
                console.log(err);
                }
      
            }
        );
        return item + " removed.";
        } 
        else
        {
            return "An error occured";
        }
        
        } 
        catch (err)
        {
            console.log('error in removeItemSMS ' + err);
            return "An error occured";

        }  
    }
}

exports.viewListsItemsSMS = async (userNumber) => { //WORKING
    let selectedList = Parser.getSelectedList();
    console.log('selectedList: ' + selectedList);
    if(selectedList == null)
    {
        return "please select a list before viewing list items"
    }
    else
    {  
        try
        {
            let user = await getUserFromDB(userNumber);
            let userID = user._id;
            if(!user)
            {
                return 'error finding account';
            }

            let listID = null;
            let temp = null;
            for(let i = 0; i < user.lists.length; i++)
            {
                let list = await List.findById(user.lists[i]);
                if(list && list.listName.toString() == selectedList)
                {
                     temp = list.listItems;
                } 
            }

            if(temp)
            {
                let final = selectedList + ": \n" + temp.join('\n');
                console.log('final: ' + final);
                return final;
            }
        
        } 
        catch (err)
        {
            console.log('error in viewItemSMS ' + err);
            return "An error occured";

        }  
    }
}

let getUserIDFromDB = async (userNumber) => {

    try {
    const Users = await User.find(); 
    let result = null;
    for(let i = 0; i < Users.length; i ++)
    {
        console.log(Users[i])
        if(Users[i].number == userNumber)
        {
            result = Users[i];
        }
    }

    console.log('result: ' + result)
    return result._id;
    } 
    catch(err)
    {
        console.log('error getting user: ' + err);
    }
}

let getListIDFromUser = async (userID, selectedList) => {


console.log('userID: ' + userID);
    try {
    let getUserList = async (num) => {
         User.findById(num, (err, foundUser) => {
            if(err)
            {
                throw err;
            }
            else 
            {
                // console.log('userLists: ' + foundUser.lists);
                return foundUser;
            }
        });
    }     

    let user =  await getUserList(userID);
    let userLists = user.lists;

    console.log('userLists: ' + userLists);


    let result = null;
    for(let i = 0; i < userLists.length; i ++)
    {
       await List.findById(userLists[i], (err,foundList)=> {
            if(err)
            {
                console.log('error in for loop: ' + err);
            }
            else
            {
                console.log('foundlist: ' + foundList.listName);
                if(foundList.listName == selectedList)
                {
                    result = foundList;
                }
            }
          
        })
    }

    console.log('result in fetch list: ' + result)
    return result._id;
    } 
    catch(err)
    {
        console.log('error getting list: ' + err);
    }
}

let getListIDFromDB = async (selectedList) => {

    try {
    const Lists = await List.find(); 
    let result = null;
    for(let i = 0; i < Lists.length; i ++)
    {
        console.log(Lists[i])
        if(Lists[i].listName == selectedList)
        {
            result = Lists[i];
        }
    }

    console.log('result: ' + result)
    return result._id;
    } 
    catch(err)
    {
        console.log('error getting list: ' + err);
    }
}
 
let getUserFromDB = async (userNumber) => {

    try {
    const Users = await User.find(); 
    let result = null;
    for(let i = 0; i < Users.length; i ++)
    {
        console.log(Users[i])
        if(Users[i].number == userNumber)
        {
            result = Users[i];
        }
    }

    console.log('result: ' + result)
    return result;
    } 
    catch(err)
    {
        console.log('error getting user: ' + err);
    }
}

let getId = (lists) => 
{
   for(let i = 0; i <lists.length; i ++)
       {
           if(lists[i].name.toString() == selectedList)
           {
               return lists[i]._id;
           }
       }
}