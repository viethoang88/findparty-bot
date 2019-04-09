var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var firebaseCredentials = require("./firebase-credentials.json");
var admin = require('firebase-admin');
// var db = admin.database();

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Firebase

var fapp = admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials),
  databaseURL: 'https://partyfind-639e0.firebaseio.com'
});

var db = admin.firestore();

// var et = db.ref('/et');
// var val = db.ref('/val')
// var oracle = db.ref('/oracle')

// et.once("value", function(snapshot) {
//   console.log(snapshot.val());
// });

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true 
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '^') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        logger.info('CMD: ' + cmd);
        logger.info('Args: ' + args);
       
        switch(cmd) {
            // ^ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            case 'create': 
                if (args.length > 0) {
                    var instance = args[1];
                    logger.info('Instance: ' + instance);
                    switch(instance) {
                        case 'ET': 
                            bot.sendMessage({
                                to: channelID,
                                message: 'Creating ET party'
                            })

                            var date = args[2];
                            var channel = args[3];
                            bot.sendMessage({
                                to: channelID,
                                message: 'ET ' + '[' + date + ']' + ' (' + channel + ')'
                            })
                        break;
                        default:
                            bot.sendMessage({
                                to: channelID,
                                message: instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY'
                            })
                        break;
                    }
                }
            break;
            // Just add any case commands if you want to..
         }
    }
    
});