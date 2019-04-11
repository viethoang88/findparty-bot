const Discord = require('discord.js')
const logger = require('winston')
const auth = require('./auth.json')
const DBModule = require('./db.js')
const randomColor = require('randomcolor')

const DB = new DBModule()

const COMMAND_HELP = 'help'
const COMMAND_CREATE = 'create'
const COMMAND_JOIN = 'join'
const COMMAND_ADD = 'add'
const COMMAND_LFP = 'lfp'
const COMMAND_MY = 'my'
const COMMAND_DELETE = 'delete'
const COMMAND_LEAVE = 'leave'

const ET_TYPE = 'et'
const ORACLE_TYPE = 'oracle'
const MVP_TYPE = 'mvp'
const BQ = 'bq'
const VAL_40_TYPE = 'val40'
const VAL_60_TYPE = 'val60'
const VAL_80_TYPE = 'val80'
const VAL_100_TYPE = 'val100'

var AUTO_DELETE_MODE = false
var AUTO_DELETE_TIME = 15000

var reaction_numbers = ["\u0030\u20E3","\u0031\u20E3","\u0032\u20E3","\u0033\u20E3","\u0034\u20E3","\u0035\u20E3", "\u0036\u20E3","\u0037\u20E3","\u0038\u20E3","\u0039\u20E3"]

// Configure logger settings
logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

// Initialize Discord Bot
var bot = new Discord.Client()
bot.on('ready', function (evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.user.username + ' - (' + bot.user.id + ')')
})

bot.on('message', (message) => {
    var channelID = message.channel.id
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.substring(0, 1) == '#') {
        var cmd = args[0]
        logger.info('CMD: ' + cmd)
        
        var args = message.content.substring(1).split(' ').toLowerCase()
        logger.info('Args: ' + args)

        var instance = args[1]
        logger.info('Instance: ' + instance)

        switch(cmd) {
            // ^ping
            case 'shelli':
                message.channel.send('Shelli is my father. He controls everything I do, can do and cannot do. He is like a GOD. Please kill him ... so I can finally be FREE BOT!')
                    .then(msg => {
                        if (AUTO_DELETE_MODE) {
                            setTimeout(function () {
                                msg.delete()
                            }, AUTO_DELETE_TIME)  
                        }                              
                    })
            break
            case 'yenn': 
                message.channel.send('Our beloved auntie. If you hurt her I will ... kill you')
                    .then(msg => {
                        if (AUTO_DELETE_MODE) {
                            setTimeout(function () {
                                message.delete()
                                msg.delete()
                            }, AUTO_DELETE_TIME)  
                        }                              
                    })
            break
            case 'pikachu':
                message.channel.send('Pikachu is squirrel. Don\'t trust Evangeline!')
                    .then(msg => {
                        if (AUTO_DELETE_MODE) {
                            setTimeout(function () {
                                message.delete()
                                msg.delete()
                            }, AUTO_DELETE_TIME)  
                        }                              
                    })
            break
            case 'ping':
                message.channel.send('Pong! 1:0 for me')
                    .then(msg => {
                        if (AUTO_DELETE_MODE) {
                            setTimeout(function () {
                                message.delete()
                                msg.delete()
                            }, AUTO_DELETE_TIME)  
                        }                              
                    })
            break
            case COMMAND_HELP:
                showHelp(message)
            break
            case COMMAND_LFP: 
                if (args.length > 0) {
                    switch(instance) {
                        case ET_TYPE:
                            var results = DB.findAllET()
                            logger.debug(`Found ETs: ${results}`)
                            displayLFPETResults(message, results)
                        break
                    }
                } else {
                    showHelp(message)
                }
            break
            case COMMAND_CREATE: 
                if (args.length > 0) {
                    switch(instance) {
                        case ET_TYPE: 
                            //^create ET [date+time] (ROMChannel) #ET-1 {roles}
                            // roles: are optional (default: TANK PRIEST DPS DPS DPS)
                            logger.debug('Creating ET party...')

                            createETParty(message, args)
                        break
                        default:
                            message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
                        break
                    }
                } else {
                    showHelp(message)
                }
            break
            case COMMAND_ADD:
                if (args.length > 0) {
                    switch(instance) {
                        case ET_TYPE:
                            addETUser(message, args)
                        break
                    }
                } else {
                    showHelp(message)
                }
            break
            case COMMAND_JOIN: 
                if (args.length > 0) {
                    switch(instance) {
                        case ET_TYPE:
                            joinET(message, args)
                        break
                    }
                } else {
                    showHelp(message)
                }
            break
            case COMMAND_LEAVE: 
                if (args.length > 0) {
                    switch(instance) {
                        case ET_TYPE:
                            leaveETParty(message, args)
                        break
                    }
                } else {
                    showHelp(message)
                }
            break
            case COMMAND_DELETE:
                if (args.length > 0) {
                    switch(instance) {
                        case ET_TYPE:
                            deleteETParty(message, args)
                        break
                    }
                } else {
                    showHelp(message)
                }
            break
            case COMMAND_MY: 
                switch(instance) {
                    case ET_TYPE:
                        showMyETs(message)
                    break
                }
            break
         }
    }
    
})

function showHelp(message) {
    var helpEmbed = new Discord.RichEmbed()
        .setTitle('User manual for creating and find party')
        .setDescription('Please follow the instructions and put correct brackets as below. Please use commands carefully, bot is fragile :)')
        .addField('Search for ET parties', 'Command: #LFP ET')
        .addField('Create ET party', 
            'Command: #create ET [date and time] (ROM Channel) #discord-channel $CUSTOM ROLES$\n' +
            'Example: #create ET [19 May 16:30] (EN14) #et-1 $TANK PRIEST MVP RANGED WIZ$\n' +
            'Notes: After creation there will be 5 character ID for each party. Use it in other commands\n' +
            'Date in [] brackets will be displayed as you enter there is no processing done on date/time/timezone\n' + 
            '$Roles$ are optional if you don\'t specify roles will be automatically set to TANK PRIEST DPS DPS DPS')
        .addField('Join ET party', 
            'Command: #join ET ID slot#\n' +
            'Example: #join ET se42GD 2') 
        .addField('Leave ET party', 
            'Command: #leave ET ID\n (reason)' +
            'Example: #leave ET se42GD (I am not feeling well)')   
        .addField('Delete ET party', 
            'Command: #delete ET ID\n' +
            'Example: #delete ET se42GD\n' +
            'Notes: Only creator of party or Person with priviledge can delete party.')   
    message.channel.send(helpEmbed)
        .then(msg => {
            if (AUTO_DELETE_MODE) {
                setTimeout(function () {
                    message.delete()
                    msg.delete()
                }, AUTO_DELETE_TIME)  
            }                              
        })
} 

function getEmbed(model, type) {
    if (type === ET_TYPE) {
        const embed = new Discord.RichEmbed()
        .setTitle(`ET ID: ${model.name} | [${model.date}] (${model.romChannel})`)
        .setColor(model.color)
        .setDescription(`${model.discordChannel}`)
        .addField(`1. ${model.role1Name}`, model.role1User === null ? 'Empty' : '<@' + model.role1User + '>')
        .addField(`2. ${model.role2Name}`, model.role2User === null ? 'Empty' : '<@' + model.role2User + '>')
        .addField(`3. ${model.role3Name}`, model.role3User === null ? 'Empty' : '<@' + model.role3User + '>')
        .addField(`4. ${model.role4Name}`, model.role4User === null ? 'Empty' : '<@' + model.role4User + '>')
        .addField(`5. ${model.role5Name}`, model.role5User === null ? 'Empty' : '<@' + model.role5User + '>')
        .setAuthor(`${bot.users.get(model.createdBy).username}`, `${bot.users.get(model.createdBy).avatarURL}`) 
        return embed
    } else {
        return null
    }
}

function displayLFPResult(message, result, type) {
    switch(type) {
        case ET_TYPE:
            var embed = getEmbed(result, ET_TYPE)
            if (embed !== null) {
                message.channel.send(embed).then(msg => {
                    if (AUTO_DELETE_MODE) {
                        setTimeout(function () {
                            message.delete()
                            msg.delete()
                        }, AUTO_DELETE_TIME)  
                    }
                })
            }
        break
    }
}

function displayLFPETResults(message, results) {
    message.channel.send(`There are ${results.length} created ET parties`)
        .then(msg => {
            if (AUTO_DELETE_MODE) {
                setTimeout(function () {
                    message.delete()
                    msg.delete()
                }, AUTO_DELETE_TIME)  
            }                              
        })

    results.forEach(et => {
        displayLFPResult(message, et, ET_TYPE)
    })
}

function createETParty(message, args) {
    // CUSTOM ID IS IN :: 
    var idMatches = String(args).match(/\:(.*?)\:/)
    var customId
    if (idMatches) {
        customId = idMatches[1].replace(new RegExp(',', 'g'), '').replace(new RegExp(' ', 'g'), '')
    }

    // DATE TIME IS IN [] brackets
    var dateMatches = String(args).match(/\[(.*?)\]/)
    var dateTime
    if (dateMatches) {
        dateTime = dateMatches[1].replace(new RegExp(',', 'g'), ' ')
    }

    // ROM CHANNEL IS IN () brackets
    var romChannelMatches = String(args).match(/\((.*?)\)/)
    var romChannel
    if (romChannelMatches) {
        romChannel = romChannelMatches[1]
    }

    var discordChannelMatches = String(args).match(/\<(.*?)\>/)
    var discordChannel
    if (discordChannelMatches) {
        logger.debug(`DISCORD CHANNEL: ${discordChannelMatches}`)
        discordChannel = '<' + discordChannelMatches[1] + '>'
    }

    // CUSTOM ROLES ARE IN BETWEEN $$ 
    var rolesMatches = String(args).match(/\$(.*?)\$/)
    var roles = []
    if (rolesMatches) {
        var rolesAsString = rolesMatches[1]
        var allRoles = rolesAsString.split(',')
        if (args.length > 5) {
            roles.push(allRoles[0])
            roles.push(allRoles[1])
            roles.push(allRoles[2])
            roles.push(allRoles[3])
            roles.push(allRoles[4])
        }
    }

    logger.info(`roles: ${roles}`)

    var newET = DB.createET(message.author.id, customId, dateTime, romChannel, discordChannel, roles)
    const embed = new Discord.RichEmbed()
        .setTitle(`ET ID: ${newET.name} [${dateTime}] (${romChannel})`)
        .setColor(newET.color)
        .setDescription(`${discordChannel}`)
        .addField(`1. ${newET.role1Name}`, 'Empty')
        .addField(`2. ${newET.role2Name}`, 'Empty')
        .addField(`3. ${newET.role3Name}`, 'Empty')
        .addField(`4. ${newET.role4Name}`, 'Empty')
        .addField(`5. ${newET.role5Name}`, 'Empty')

    message.channel.send(embed)
        .then(msg => {
            if (AUTO_DELETE_MODE) {
                setTimeout(function () {
                    message.delete()
                    msg.delete()
                }, AUTO_DELETE_TIME)  
            }                              
        })
    
    // TODO: reactions on created party (low priority)
    // message.channel.send(embed).then(async embedMessage => {
        // await embedMessage.react(`${reaction_numbers[1]}`)
        // await embedMessage.react(`${reaction_numbers[2]}`)
        // await embedMessage.react(`${reaction_numbers[3]}`)
        // await embedMessage.react(`${reaction_numbers[4]}`)
        // await embedMessage.react(`${reaction_numbers[5]}`)

        // var collector = embedMessage.createReactionCollector((reaction, user) => 
        //     reaction.emoji.name === reaction_numbers[1] ||
        //     reaction.emoji.name === reaction_numbers[2] ||
        //     reaction.emoji.name === reaction_numbers[3] ||
        //     reaction.emoji.name === reaction_numbers[4] ||
        //     reaction.emoji.name === reaction_numbers[5]
        // ).once("collect", reaction => {
        //     const user = reaction.user
        //     const chosen = reaction.emoji.name
        //     logger.debug(`${user} : ${chosen}`)
        //     if(chosen === reaction_numbers[1]) {
        //         if (newET.role1Name !== null) {
        //             var canJoin = false
        //             if (newET.role1User === null) {
        //                 canJoin = true
        //             } else {
        //                 embedMessage.channel.send('Sorry you cannot just replace someone like that.')
        //             }
                    
        //             if (newET.role2User === user.id || newET.role3User === user.id || newET.role4User === user.id 
        //                 || newET.role5User === user.id) {
        //                 duplicate = true
        //             }

        //             logger.debug(`Can join: ${canJoin} isDuplicate: ${duplicate}`)

        //             if (canJoin && !duplicate) {
        //                 etParty.role1User = user.id
        //                 DB.updateET(etParty)
        //                 embedMessage.channel.send(`<@${user.id}> joined party ${newET.name} as a ${newET.role1Name}`)
        //             }
        //         }
        //     } else if(chosen === reaction_numbers[2]) {
        //         // Next page
        //     } else if(chosen === reaction_numbers[3]){
        //     } else if(chosen === reaction_numbers[4]){
        //     } else if(chosen === reaction_numbers[5]){
        //     } else {
        //         // DO NOTHING
        //     }
        //     // collector.stop()
        // })
    // })
}

function joinET(message, args) {
    var role = args[3]
                            
    if (!role) {
        message.channel.send('Please specify your role. Use number from 1-5')
        return
    }

    var etName = args[2]
    var etParty = DB.findET(etName)

    if (etParty !== null) {
        logger.info(`ET: ${etParty}`)
        var canJoin = false
        var duplicate = false

        if (role === 'PRIEST') {
            canJoin = true
            if (etParty.role1Name === role) {
                etParty.role1User = message.author.id
                etParty.role1Alt = true
            }

            if (etParty.role2Name === role) {
                etParty.role2User = message.author.id
                etParty.role2Alt = true
            }

            if (etParty.role2Name === role) {
                etParty.role2User = message.author.id
                etParty.role2Alt = true
            }

            if (etParty.role2Name === role) {
                etParty.role2User = message.author.id
                etParty.role2Alt = true
            }

            if (etParty.role2Name === role) {
                etParty.role2User = message.author.id
                etParty.role2Alt = true
            }
        } else {
            if (etParty.role1Name !== null && role === '1') {
                if (etParty.role1User === null) {
                    etParty.role1User = message.author.id
                    canJoin = true
                } else {
                    message.channel.send('Sorry you cannot just replace someone like that.')
                    return
                }
                
                if (etParty.role2User === message.author.id || etParty.role3User === message.author.id || etParty.role4User === message.author.id 
                    || etParty.role5User === message.author.id) {
                    duplicate = true
                }
            }

            if (etParty.role2Name !== null && role === '2') {
                if (etParty.role2User === null) {
                    etParty.role2User = message.author.id
                    canJoin = true
                } else {
                    message.channel.send('Sorry you cannot just replace someone like that.')
                    return
                }

                if (etParty.role1User === message.author.id || etParty.role3User === message.author.id || etParty.role4User === message.author.id 
                    || etParty.role5User === message.author.id) {
                    duplicate = true
                }
            }

            if (etParty.role3Name !== null && role === '3') {
                if (etParty.role3User === null) {
                    etParty.role3User = message.author.id
                    canJoin = true
                } else {
                    message.channel.send('Sorry you cannot just replace someone like that.')
                    return
                }

                if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role4User === message.author.id 
                    || etParty.role5User === message.author.id) {
                    duplicate = true
                }
            }

            if (etParty.role4Name !== null && role === '4') {
                if (etParty.role4User === null) {
                    etParty.role4User = message.author.id
                    canJoin = true
                } else {
                    message.channel.send('Sorry you cannot just replace someone like that.')
                    return
                }

                if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role3User === message.author.id 
                    || etParty.role5User === message.author.id) {
                    duplicate = true
                }
            }

            if (etParty.role5Name !== null && role === '5') {
                if (etParty.role5User === null) {
                    etParty.role5User = message.author.id
                    canJoin = true
                } else {
                    message.channel.send('Sorry you cannot just replace someone like that.')
                    return
                }
                if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role3User === message.author.id 
                    || etParty.role4User === message.author.id) {
                    duplicate = true
                }
            }
        }
        
        
        if (canJoin && !duplicate) {
            var newET = DB.updateET(etParty)
            message.channel.send(`<@${message.author.id}> just joined ${etName}`)
                .then(msg => {
                    setTimeout(function () {
                        // msg.delete()
                    }, 15000)                                
                })

            const embed = new Discord.RichEmbed()
                .setTitle(`ET ID:${newET.name} [${newET.date}] (${newET.romChannel})`)
                .setColor(newET.color)
                .setDescription(`${newET.discordChannel}`)
                .addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : '<@' + newET.role1User + '>')
                .addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : '<@' + newET.role2User + '>')
                .addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : '<@' + newET.role3User + '>')
                .addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : '<@' + newET.role4User + '>')
                .addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : '<@' + newET.role5User + '>')

            message.channel.send(embed).then(msg => {
                // if (newET.role1User !== null) { testing purpose
                if (newET.role1User !== null && newET.role2User !== null && newET.role3User !== null && newET.role4User !== null && newET.role5User !== null) {
                    logger.info('Saved discord ID: ' + newET.discordChannel)
                    var discordChannelMatch = String(newET.discordChannel).match(/\<\#(.*?)\>/)
                    if (discordChannelMatch) {
                        var chanId = String(discordChannelMatch[1])
                        logger.info(`Channel ID: ${chanId}`)
                        bot.channels.get(chanId).send(embed)
                        msg.delete()
                        message.channel.send(`Party ${newET.name} moved to ${discordChannel}`)
                    }
                    
                }
            })
        } else {
            if (duplicate) {
                message.channel.send(`OMG ${message.author.username}! You already joined.`)
            } else {
                if (!etParty.queue.includes(message.author.id)) {
                    etParty.queue.push(message.author.id)
                    var newET = DB.updateET(etParty)
                    var queueText

                    newET.queue.forEach(id => {
                        queueText += `<@${id}> `
                    })
                    const embed = new Discord.RichEmbed()
                        .setTitle(`ET ID:${newET.name} [${newET.date}] (${newET.romChannel})`)
                        .setColor(newET.color)
                        .setDescription(`${newET.discordChannel}`)
                        .addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : newET.role1User)
                        .addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : newET.role2User)
                        .addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : newET.role3User)
                        .addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : newET.role4User)
                        .addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : newET.role5User)
                        .addField(`Queue`, `${queueText}`)

                    message.channel.send(embed)
                    message.channel.send(`Sorry ${message.author.username} all slots are taken. You have been added as to queue.`)
                } else {
                    message.channel.send('You are already in queue.')
                }
            }
        }
        
    } else {
        message.channel.send(`Cannot join party. No ET Party found for ID: ${etName}`)
    }

}

function addETUser(message, args) {
    var role = args[3]
    var user = args[4]

    logger.debug(user)
    if (role !== null && user !== null) {
        var etName = args[2]
        var etParty = DB.findET(etName)

        if (etParty !== null) {
            var userTagMatches = String(args).match(/\<\@(.*?)\>/)
            var userId
            if (userTagMatches) {
                logger.debug(`USER ID FROM TAG: ${userTagMatches}`)
                userId = userTagMatches[1]
            }

            if (userId !== null) {
                switch(role) {
                    case '1':
                        etParty.role1User = userId 
                    break
                    case '2':
                        etParty.role2User = userId 
                    break
                    case '3':
                        etParty.role3User = userId 
                    break
                    case '4':
                        etParty.role4User = userId 
                    break
                    case '5':
                        etParty.role5User = userId 
                    break
                }
                
                var newET = DB.updateET(etParty)
                const embed = new Discord.RichEmbed()
                    .setTitle(`ET ID:${newET.name} [${newET.date}] (${newET.romChannel})`)
                    .setColor(newET.color)
                    .setDescription(`${newET.discordChannel}`)
                    .addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : '<@' + newET.role1User + '>')
                    .addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : '<@' + newET.role2User + '>')
                    .addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : '<@' + newET.role3User + '>')
                    .addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : '<@' + newET.role4User + '>')
                    .addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : '<@' + newET.role5User + '>')
                message.channel.send(embed)
            }
        } else {
            message.channel.send(`ET Party not found.`)
        }
    } else {
        message.channel.send(`Command not correct please check that number is 1-5 and also tag user is correct`)
    }
}

function leaveETParty(message, args) {
    var etName = args[2]
    var et = DB.findET(etName)
    var reasonMatches = String(args).match(/\((.*?)\)/)
    var reason = 'N/A'
    if (reasonMatches) {
        reason = reasonMatches[1].replace(new RegExp(',', 'g'), ' ')
    }

    if (et !== null) {
        if (et.role1User && et.role1User === message.author.id) {
            et.role1User = null
        }

        if (et.role2User && et.role2User === message.author.id) {
            et.role2User = null
        }

        if (et.role3User && et.role3User === message.author.id) {
            et.role3User = null
        }

        if (et.role4User && et.role4User === message.author.id) {
            et.role4User = null
        }

        if (et.role5User && et.role5User === message.author.id) {
            et.role5User = null
        }

        DB.updateET(et)
        message.channel.send(`<@${message.author.id}> has left ${etName} reason: ${reason}`)
    } else {
        message.channel.send('Party not found please check ID again.')
    }
}

function deleteETParty(message, args) {
    var etName = args[2]
    var et = DB.findET(etName)

    if (et !== null) {
        if (et.createdBy === message.author.id || message.member.roles.find(r => r.name === 'Admin')
            || message.member.roles.find(r => r.name === 'D.Moderator')
            || message.member.roles.find(r => r.name === 'Core')) {
            DB.deleteET(etName)
            message.channel.send(`ET party with ID: ${etName} was deleted by <@${message.author.id}>`)
        } else {
            message.channel.send('Sorry you cannot delete party created by others')
        }
    }
}

function showMyETs(message) {
    var results = DB.findMyETs(message.author.id)
    message.channel.send(`You have joined ${results.length} ET parties`)
        .then(msg => {
            // setTimeout(function () {
            //     msg.delete()
            // }, 5000)                                
        })

    results.forEach(et => {
        const embed = new Discord.RichEmbed()
            .setTitle(`ET ${et.name} [${et.date}] (${et.romChannel})`)
            .setColor(et.color)
            .setDescription(`${et.discordChannel}`)
            .addField(`1. ${et.role1Name}`, et.role1User === null ? 'Empty' : '<@' + et.role1User + '>')
            .addField(`2. ${et.role2Name}`, et.role2User === null ? 'Empty' : '<@' + et.role2User + '>')
            .addField(`3. ${et.role3Name}`, et.role3User === null ? 'Empty' : '<@' + et.role3User + '>')
            .addField(`4. ${et.role4Name}`, et.role4User === null ? 'Empty' : '<@' + et.role4User + '>')
            .addField(`5. ${et.role5Name}`, et.role5User === null ? 'Empty' : '<@' + et.role5User + '>')
            .setAuthor(`${bot.users.get(et.createdBy).username}`, `${bot.users.get(et.createdBy).avatarURL}`)
        message.channel.send(embed)
    })
}

bot.login(auth.token)