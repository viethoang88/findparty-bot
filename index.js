const fs = require('fs');
const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth.json');
const DBModule = require('./db.js');
const randomColor = require('randomcolor');
const varFile = require('./variables/var.js');

const COMMAND_HELP = 'help';
const COMMAND_CREATE = 'create';
const COMMAND_JOIN = 'join';
const COMMAND_ADD = 'add';
const COMMAND_LIST = 'list';
const COMMAND_MY = 'my';
const COMMAND_DELETE = 'delete';
const COMMAND_LEAVE = 'leave';

var CMD_PREFIX = varFile.CMD_PREFIX;
var AUTO_DELETE_COMMANDS = varFile.AUTO_DELETE_COMMANDS;

var reaction_numbers = ["\u0030\u20E3","\u0031\u20E3","\u0032\u20E3","\u0033\u20E3","\u0034\u20E3","\u0035\u20E3", "\u0036\u20E3","\u0037\u20E3","\u0038\u20E3","\u0039\u20E3"]

// Configure logger settings
logger.remove(logger.transports.Console)
logger.add(new logger.transports.Console, {
    colorize: true
})
logger.level = 'debug'

// Initialize Discord Bot
// const bot = new Discord.Client();
const bot = varFile.bot;
bot.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.on('ready', function (evt) {
    logger.info('Connected')
    logger.info('Logged in as: ')
    logger.info(bot.user.username + ' - (' + bot.user.id + ')')
})

bot.on('message', (message) => {
    if (!message.content.startsWith(CMD_PREFIX) || message.author.bot) return;

    const args = message.content.slice(CMD_PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();
    const cmd = command;

    if (!bot.commands.has(command)) {
        message.reply('This don\'t do anything. Please check your spelling. Use **' + CMD_PREFIX + 'help** for list of commands available.');
        return;
    };

    try {
        bot.commands.get(command).execute(message, args);
        if (AUTO_DELETE_COMMANDS) {
            message.delete();
        }
    } catch (error) {
        logger.error(error);
        logger.error(error.message);
        message.reply('There is an error with your command. Please check your spelling. Use **' + CMD_PREFIX + 'help** for list of commands available.');
    }

    var channelID = message.channel.id
    
})

bot.login(auth.token)