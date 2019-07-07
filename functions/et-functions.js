const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const Discord = require('discord.js');
const logger = require('winston');

const bot = varFile.bot;
const DB = varFile.DB;
const prefix = varFile.CMD_PREFIX;
const ET_TYPE = varFile.ET_TYPE;
const AUTO_DELETE_MODE = varFile.AUTO_DELETE_MODE;
const AUTO_DELETE_TIME = varFile.AUTO_DELETE_TIME;

module.exports = {
	showMyETs: function(message) {
		const results = DB.findMyETs(message.author.id);
		message.channel.send(`You have joined ${results.length} ET parties`)
			.then(msg => {
			// setTimeout(function () {
			//     msg.delete();
			// }, 5000)
			});

		results.forEach(et => {
			const embed = func.getEmbedNoNotif(et, ET_TYPE)
			message.channel.send(embed);
		});
	},
	displayETResults: function(message, args, results) {
		if (results.length == 0) {
			message.channel.send(`No ET party has been created.`)
			.then(msg => {
				if (AUTO_DELETE_MODE) {
					setTimeout(function() {
						message.delete();
						msg.delete();
					}, AUTO_DELETE_TIME);
				}
			});
		} else {
			message.channel.send(`There are ${results.length} ET parties.`)
			.then(msg => {
				if (AUTO_DELETE_MODE) {
					setTimeout(function() {
						message.delete();
						msg.delete();
					}, AUTO_DELETE_TIME);
				}
			});
		}
		
		let options = '';
		if (func.isDefined(args[1])) {
			options = args[1].split(/\$+/);
		}
		if(args[1] == 'all' ) {
			results.forEach(et => {
				func.displayLFPResultNoNotif(message, et, ET_TYPE);
			});
		} else if(options[0] == 'all' && options[1] == 'id') {
			let etIDs = '';
			results.forEach(et => {
				etIDs += `${et.name} `;
			});
			let outputMessage = `The ET Party IDs are: ${etIDs}`;
			if (etIDs !== '') {
				message.channel.send(outputMessage).then(msg => {
					if (AUTO_DELETE_MODE) {
						setTimeout(function() {
							message.delete();
							msg.delete();
						}, AUTO_DELETE_TIME);
					}
				});
			}
		} else {
			results.forEach(et => {
				if (et.status === "OPEN") {
					func.displayLFPResult(message, et, ET_TYPE);
				}
			});
		}
	},
	createETParty: function(message, args) {
		// CUSTOM ID IS IN ::
		const idMatches = String(args).match(/\:(.*?)\:/);
		let customId;
		if (idMatches) {
			customId = idMatches[1].replace(new RegExp(`,`, `g`), ``).replace(new RegExp(` `, `g`), ``);
			const customNameExists = DB.doesETNameExist(customId);
			// logger.info('customNameExists: ' + customNameExists);
			if (customNameExists) {
				message.channel.send('Please choose another party name. This name has been used.');
				return;
			}
			args = String(args).replace(idMatches[0],'');
		}

		// DATE TIME IS IN [] brackets
		const dateMatches = String(args).match(/\[(.*?)\]/);
		let dateTime;
		if (dateMatches) {
			dateTime = dateMatches[1].replace(new RegExp(`,`, `g`), ` `);
			args = String(args).replace(dateMatches[0],'');
		} else {
			message.channel.send('Please specify the date and time in [ ] brackets in the command.');
			return;
		}

		// ROM CHANNEL IS IN () brackets
		const romChannelMatches = String(args).match(/\((.*?)\)/);
		let romChannel;
		if (romChannelMatches) {
			romChannel = romChannelMatches[1];
		} else {
			romChannel = 'Channel TBC';
		}

		// DISCORD CHANNEL IS IN <> brackets
		const discordChannelMatches = String(args).match(/\<(.*?)\>/);
		const discordChannelMatch = String(args).match(/\<\#(.*?)\>/);
		let discordChannel;
		if (discordChannelMatches) {
			// logger.debug(`DISCORD CHANNEL: ${discordChannelMatches}`);
			const chanId = String(discordChannelMatch[1]);
			if (bot.channels.get(chanId) === undefined) {
				return message.channel.send('Sorry, discord channel does not exist. Please use # to check channels and try again.');
			}
			discordChannel = '<' + discordChannelMatches[1] + '>';
		} else {
			message.channel.send('Please specify an existing discord channel using # in the command. E.g. #et-1');
			return;
		}

		// CUSTOM ROLES ARE IN BETWEEN $$
		const rolesMatches = String(args).match(/\$(.*?)\$/);
		let roles = [];
		if (rolesMatches) {
			const rolesAsString = rolesMatches[1];
			const allRoles = rolesAsString.split(`,`);
			if (args.length > 5) {
				roles.push(allRoles[0]);
				roles.push(allRoles[1]);
				roles.push(allRoles[2]);
				roles.push(allRoles[3]);
				roles.push(allRoles[4]);
			}
		}

		// logger.info(`roles: ${roles}`);

		const newET = DB.createET(message.author.id, customId, dateTime, romChannel, discordChannel, roles);
		const embed = new Discord.RichEmbed()
			.setTitle(`ET ID: ${newET.name} [${dateTime}] (${romChannel})`)
			.setColor(newET.color)
			.setDescription(`${discordChannel}`)
			.addField(`1. ${newET.role1Name}`, `Empty`)
			.addField(`2. ${newET.role2Name}`, `Empty`)
			.addField(`3. ${newET.role3Name}`, `Empty`)
			.addField(`4. ${newET.role4Name}`, `Empty`)
			.addField(`5. ${newET.role5Name}`, `Empty`);

		message.channel.send(embed)
			.then(msg => {
				if (AUTO_DELETE_MODE) {
					setTimeout(function() {
						message.delete();
						msg.delete();
					}, AUTO_DELETE_TIME);
				}
			});
	},
};