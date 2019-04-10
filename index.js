const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const feathers = require('@feathersjs/feathers');
const feathersApp = feathers();

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

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
                            //^create ET [date+time] (ROMChannel) #ET-1 {roles}
                            // roles: are optional (default: TANK PRIEST DPS DPS DPS)
                            bot.sendMessage({
                                to: channelID,
                                message: 'Creating ET party'
                            })

                            var dateTime = args[2]; // just string
                            var romChannel = args[3]; // eg: EN14
                            var discordChannel = args[4]; // #ET-1
                            var roles = [];

                            if (args.length > 5) {
                                roles.push(args[5]);
                                roles.push(args[6]);
                                roles.push(args[7]);
                                roles.push(args[8]);
                                roles.push(args[9]);
                            }

                            createET(channelID, dateTime, romChannel, discordChannel, roles);
                        
                            // bot.sendMessage({
                            //     to: channelID,
                            //     message: 'ET ' + '[' + dateTime + ']' + ' (' + romChannel + ')'
                            // })
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

async function createET(channelID, date, romChannel, discordChannel, roles) {
    var newEt;
    if (roles.length > 0) {
        newEt = {
          date: date,
          romChannel: romChannel,
          discordChannel: discordChannel,
          role1Name: roles[0],
          role2Name: roles[1],
          role3Name: roles[2],
          role4Name: roles[3],
          role5Name: roles[4]
        }
    } else {
        newEt = {
            date: date,
            romChannel: romChannel,
            discordChannel: discordChannel,
            role1Name: 'TANK',
            role2Name: 'PRIEST',
            role3Name: 'DPS',
            role4Name: 'DPS',
            role5Name: 'DPS'
          }
    } 

    await app.service('et').create({
        date: date,
        romChannel: romChannel,
        discordChannel: discordChannel,
    });

    bot.sendMessage({
        to: channelID,
        message: 'ET ' + '[' + dateTime + ']' + ' (' + romChannel + ') $(discordChannel) \n' +
                 '1. $(role1Name) \n' + 
                 '2. $(role2Name) \n' +
                 '3. $(role3Name) \n' +
                 '4. $(role4Name) \n' +
                 '5. $(role5Name) \n'
    })
}

// Setup feathers 
feathersApp.use('et', {
    // async get(id) {
    //     return {
    //         id, 
    //         date, 
    //         romChannel,
    //         discordChannel,
    //         comment,
    //         role1Name,
    //         role1User,
    //         role2Name, 
    //         role2User,
    //         role3Name,
    //         role3User,
    //         role4Name, 
    //         role4User,
    //         role5Name,
    //         role5User,
    //     }
    // }
})

class ET {
    constructor() {
        this.ets = [];
        this.currentId = 0;
    }

    async find(params) {
        return this.ets;
    }

    async get(id, params) {
        const et = this.ets.find(et => et.id === parseInt(id, 10));

        if (!et) {
            throw new Error('No ET instance found with id ${id}');
        }

        return et;
    }

    async create(data, params) {
        const et = Object.assign({
            id: ++this.currentId
        }, data);

        this.ets.push(et);

        return et;
    }

    async patch(id, data, params) {
        const et = await this.get(id);

        return Object.assign(et, data);
    }

    async remove(id, params) {
        const et = await this.get(id);

        const index = this.ets.indexOf(et);

        this.ets.splice(index, 1);

        return et;
    }
}