const Discord = require('discord.js')
const logger = require('winston')
const auth = require('./auth.json')
const DBModule = require('./db.js')
const DB = new DBModule()

// Configure logger settings
logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true 
})
bot.on('ready', function (evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.username + ' - (' + bot.id + ')')
})

bot.on('message', (message) => {
    var channelID = message.channel.id
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '^') {
        var args = message.content.substring(1).split(' ')
        var cmd = args[0]
        
        logger.info('CMD: ' + cmd)
        logger.info('Args: ' + args)
        var instance = args[1]
        logger.info('Instance: ' + instance)

        switch(cmd) {
            // ^ping
            case 'ping':
                bot.channel.send({
                    to: channelID,
                    message: 'Pong!'
                })
            break
            case 'show': 
                if (args.length > 0) {
                    switch(instance) {
                        case 'ET':
                            var results = DB.findAllET()
                            logger.info(`ETs: ${results}`)
                            message.channel.send(`There are ${results.length} created ET parties`)
                            .then(msg => {
                                setTimeout(function () {
                                    msg.delete()
                                }, 5000)                                
                            })
                            message.delete()

                        break
                    }
                    
                }
            break
            case 'create': 
                logger.info(`args: ${args}`)
                if (args.length > 0) {
                    switch(instance) {
                        case 'ET': 
                            //^create ET [date+time] (ROMChannel) #ET-1 {roles}
                            // roles: are optional (default: TANK PRIEST DPS DPS DPS)
                            logger.info('Creating ET party...')

                            var dateTime = args[2] // just string
                            var romChannel = args[3] // eg: EN14
                            var discordChannel = args[4] // #ET-1
                            var roles = []

                            if (args.length > 5) {
                                roles.push(args[5])
                                roles.push(args[6])
                                roles.push(args[7])
                                roles.push(args[8])
                                roles.push(args[9])
                            }

                            logger.info(`roles: ${roles}`)

                            var newET = DB.createET(dateTime, romChannel, discordChannel, roles)
                            const embed = new Discord.RichEmbed()
                                .setTitle(`ET ${newET.name} [${dateTime}] (${romChannel})`)
                                .setColor(0xFF0000)
                                .setDescription(`${discordChannel}`)
                                .addField(`1. ${newET.role1Name}`, 'Empty')
                                .addField(`2. ${newET.role2Name}`, 'Empty')
                                .addField(`3. ${newET.role3Name}`, 'Empty')
                                .addField(`4. ${newET.role4Name}`, 'Empty')
                                .addField(`5. ${newET.role5Name}`, 'Empty')

                            message.channel.send(embed)
                            // message.delete()
                        break
                        default:
                            message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
                        break
                    }
                }
            break
            case 'join': 
                if (args.length > 0) {
                    switch(instance) {
                        case 'ET':
                            var etName = args[2]
                            var role = args[3]
                            var etParty = DB.findET(etName)

                            if (role === null) {
                                message.channel.send('Please specify your role. Use number from 1-5')
                                break;
                            }

                            if (etParty !== null) {
                                logger.info(`ET: ${etParty}`)
                                var canJoin = false
                                var duplicate = false
                                if (etParty.role1Name !== null && role === '1') {
                                    etParty.role1User = message.author.id
                                    canJoin = true;
                                }

                                if (etParty.role2Name !== null && role === '2') {
                                    etParty.role2User = message.author.id
                                    canJoin = true;
                                }

                                if (etParty.role3Name !== null && role === '3') {
                                    etParty.role3User = message.author.id
                                    canJoin = true;
                                }

                                if (etParty.role4Name !== null && role === '4') {
                                    etParty.role4User = message.author.id
                                    canJoin = true;
                                }

                                if (etParty.role5Name !== null && role === '5') {
                                    etParty.role5User = message.author.id
                                    canJoin = true;
                                }

                                if (canJoin) {

                                    // if (etParty.role1User === message.author.tag || etParty.role2User === message.author.tag || etParty.role3User === message.author.tag || etParty.role4User === message.author.tag || etParty.role5User === message.author.tag) {
                                    //     duplicate = true;
                                    // } 
                                }
                                
                                if (canJoin && !duplicate) {
                                    var newET = DB.updateET(etParty)
                                    message.channel.send(`${message.author.tag} have joined ${etName} as ${role}`)
                                        .then(msg => {
                                            setTimeout(function () {
                                                msg.delete()
                                            }, 5000)                                
                                        })
    
                                    const embed = new Discord.RichEmbed()
                                        .setTitle(`ET ${newET.name} [${newET.date}] (${newET.romChannel})`)
                                        .setColor(0xFF0000)
                                        .setDescription(`${newET.discordChannel}`)
                                        .addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : '<@' + newET.role1User + '>')
                                        .addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : '<@' + newET.role2User + '>')
                                        .addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : '<@' + newET.role3User + '>')
                                        .addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : '<@' + newET.role4User + '>')
                                        .addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : '<@' + newET.role5User + '>')
    
                                    message.channel.send(embed)
                                } else {
                                    if (duplicate) {
                                        message.channel.send(`OMG ${message.author.username}! You already joined.`)
                                    } else {
                                        etParty.queue.push(message.author.username)
                                        var newET = DB.updateET(etParty)
                                        const embed = new Discord.RichEmbed()
                                            .setTitle(`ET ${newET.name} [${newET.date}] (${newET.romChannel})`)
                                            .setColor(0xFF0000)
                                            .setDescription(`${newET.discordChannel}`)
                                            .addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : newET.role1User)
                                            .addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : newET.role2User)
                                            .addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : newET.role3User)
                                            .addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : newET.role4User)
                                            .addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : newET.role5User)
                                            .addField(`Queue`, `${newET.queue}`)
        
                                        message.channel.send(embed)
                                        message.channel.send(`Sorry ${message.author.username} all slots are taken. You have been added as to queue.`)
                                    }
                                }
                                
                            } else {
                                message.channel.send(`Cannot join party. No ET Party found for ID: ${etName}`)
                            }
                            // message.delete()

                        break
                    }
                    
                }
            break
            case 'delete':
            break

         }
    }
    
})

bot.login(auth.token)