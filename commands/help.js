const Discord = require('discord.js');

const func = require('../functions/functions.js');
const varFile = require('../variables/var.js');
const prefix = varFile.CMD_PREFIX;

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			func.showHelp(message);
			data.push('Here\'s a list of all my commands:');
			data.push(commands.map(command => command.name).join(', '));
			data.push('\nYou can send \`' + prefix + 'help [command name]\` to get info on a specific command!');

			return message.author.send(data, { split: true })
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('I\'ve sent you a DM with all my commands!');
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('That\'s not a valid command!');
		}

		// data.push(`**Name:** ${command.name}`);

		// if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
		// if (command.description) data.push(`**Description:** ${command.description}`);
		// if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		// data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

		let helpEmbed = new Discord.RichEmbed()
			.setTitle(`How to Use ${prefix}${command.name}`)
			.setDescription(`${command.description}`)
			.addField('Format',
				`${prefix}${command.name} ${command.format}`)
			.addField('Example',
				`${prefix}${command.name} ${command.example}`);

		if(command.notes !== null && command.notes !== undefined) {
			helpEmbed = helpEmbed.addField('Notes',
				`${command.notes}`);
		}

		// message.channel.send(data, { split: true });
		message.channel.send(helpEmbed);
	},
};