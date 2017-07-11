var builder = require('botbuilder');
var express = require('express');


// Bot Setup

// Setup express server
var app = express();


// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || "",
    appPassword: process.env.MICROSOFT_APP_PASSWORD || ""
});
var bot = new builder.UniversalBot(connector);

app.post('/api/messages', connector.listen());

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});

var listner = app.listen(process.env.port || process.env.PORT || 3000, function () {
   console.log('%s listening to %s', app.name, listner.address().port); 
});


//=========================================================
// Bots Dialogs
//=========================================================
String.prototype.contains = function(content){
  return this.indexOf(content) !== -1;
}

bot.dialog('/', function (session) {
    console.log(session.message.user.name + ' -> ' +session.message.text.toLowerCase());
    if(session.message.text.toLowerCase().contains('hello') || session.message.text.toLowerCase().contains('hi')){
			          // console.log('user '+ session.userData.name)
        if (session.userData.name === undefined){
          session.userData.name = session.message.user.name
        }

        session.send('Hey, '+ session.userData.name +' How are you?');

      }else if((m = /^\good (morning|evening)/i.exec(session.message.text)) !== null){
        greets = Array('Good day to you too', 'Wish you the same', 'hmm');
        session.send(greets[Math.floor(Math.random()*greets.length)]);
      }else if(/^change name/i.test(session.message.text)){
          session.beginDialog('/changeName');
       
      }else if(session.message.text.toLowerCase().contains('thank')){
			  session.send('You are welcome');
      }else{
			  session.send('Sorry I don\'t understand you...');
      }
});

bot.dialog('/changeName', [
    function (session, next) {
        session.dialogData.NewName = " ";
        builder.Prompts.text(session, "Well that's new. What do you want me to call you?");
    },
    function (session, results) {
        session.dialogData.NewName = results.response;
        builder.Prompts.choice(session, "Are you sure you want me to call you " + session.dialogData.NewName + "?", ["Yes", "No"]);
    },
    function (session, results) {
        if (results.response.entity == "Yes") {
            session.userData.name = session.dialogData.NewName;
            session.endDialog("Alright " + session.userData.name + "!!!");
        }
        else {
            session.endDialog("Phew! I am anyways not good at remembering names.");
        }
    }
]);

// search dialog
bot.dialog('search', function (session, args, next) {
    // perform search
    // console.log(args.intent.matched[1].trim());
    var messageText = args.intent.matched[1].trim();
    // session.send('%s, wait a few seconds. Searching for \'%s\' ...', session.message.user.name, messageText);
    session.send('https://www.bing.com/search?q=%s', encodeURIComponent(messageText));
    session.endDialog();
}).triggerAction({ matches: /^search (.*)/i });//regex pattern matching

bot.dialog('HelpDialog', require('./support'))
    .triggerAction({ 
      matches: [/help/i, /support/i, /problem/i] 
});

// reset bot dialog
bot.dialog('reset', function (session) {
    delete session.userData.name
    session.endDialog('Ups... I\'m suffering from a memory loss...');
}).triggerAction({ matches: /^reset/i });
