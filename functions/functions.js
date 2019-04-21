const varFile = require('../variables/var.js');
const Discord = require('discord.js');
// const logger = require('winston');

const bot = varFile.bot;
const DB = varFile.DB;
const ET_TYPE = varFile.ET_TYPE;
const AUTO_DELETE_MODE = varFile.AUTO_DELETE_MODE;
const AUTO_DELETE_TIME = varFile.AUTO_DELETE_TIME;

module.exports = {
	showHelp: function(message) {
		const helpEmbed = new Discord.RichEmbed()
			.setTitle('User manual for creating and find party')
			.setDescription('Please follow the instructions and put correct brackets as below. Please use commands carefully, bot is fragile :)')
			.addField('List out all ET parties or specific party (coming soon)',
				'Command: ?list ET or ?list ET ID\n' +
				'Example: ?list ET se42GD\n')
			.addField('Create ET party',
				'Command: ?create ET [date and time] (ROM Channel) <#discord-channel> $CUSTOM ROLES$\n' +
				'Example: ?create ET [19 May 16:30] (EN14) <#et-1> $TANK PRIEST MVP RANGED WIZ$\n' +
				'Notes: After creation there will be 5 character ID for each party. Use it in other commands\n' +
				'Date in [] brackets will be displayed as you enter there is no processing done on date/time/timezone\n' +
				'$Roles$ are optional if you don\'t specify roles will be automatically set to TANK PRIEST DPS DPS DPS')
			.addField('Join ET party',
				'Command: ?join ET ID slot#\n' +
				'Example: ?join ET se42GD 2')
			.addField('Leave ET party',
				'Command: ?leave ET ID\n (reason)' +
				'Example: ?leave ET se42GD (I am not feeling well)')
			.addField('Delete ET party',
				'Command: ?delete ET ID\n' +
				'Example: ?delete ET se42GD 1fnj12\n' +
				'Notes: Only creator of party or person with permissions can delete party.');
		message.channel.send(helpEmbed)
			.then(msg => {
				if (AUTO_DELETE_MODE) {
					setTimeout(function() {
						message.delete();
						msg.delete();
					}, AUTO_DELETE_TIME);
				}
			});
	},
	isDefined: function(variable) {
		if (typeof variable === 'undefined' || variable === null) {
			return false;
		} else {
			return true;
		}
	},
	displayLFPETResults: function(message, results) {
		message.channel.send(`There are ${results.length} created ET parties`)
			.then(msg => {
				if (AUTO_DELETE_MODE) {
					setTimeout(function() {
						message.delete();
						msg.delete();
					}, AUTO_DELETE_TIME);
				}
			});

		results.forEach(et => {
			this.displayLFPResult(message, et, ET_TYPE);
		});
	},
	displayLFPResult: function(message, result, type) {
		const embed = this.getEmbed(result, ET_TYPE);
		switch(type) {
		case ET_TYPE:
			if (embed !== null) {
				message.channel.send(embed).then(msg => {
					if (AUTO_DELETE_MODE) {
						setTimeout(function() {
							message.delete();
							msg.delete();
						}, AUTO_DELETE_TIME);
					}
				});
			}
			break;
		}
	},
	getEmbed: function(model, type) {
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
				.setAuthor(`${bot.users.get(model.createdBy).username}`, `${bot.users.get(model.createdBy).avatarURL}`);
			return embed;
		} else {
			return null;
		}
	},
	createETParty: function(message, args) {
		// CUSTOM ID IS IN ::
		const idMatches = String(args).match(/\:(.*?)\:/);
		let customId;
		if (idMatches) {
			customId = idMatches[1].replace(new RegExp(',', 'g'), '').replace(new RegExp(' ', 'g'), '');
		}

		// DATE TIME IS IN [] brackets
		const dateMatches = String(args).match(/\[(.*?)\]/);
		let dateTime;
		if (dateMatches) {
			dateTime = dateMatches[1].replace(new RegExp(',', 'g'), ' ');
		}

		// ROM CHANNEL IS IN () brackets
		const romChannelMatches = String(args).match(/\((.*?)\)/);
		let romChannel;
		if (romChannelMatches) {
			romChannel = romChannelMatches[1];
		}

		// DISCORD CHANNEL IS IN <> brackets
		const discordChannelMatches = String(args).match(/\<(.*?)\>/);
		let discordChannel;
		if (discordChannelMatches) {
			// logger.debug(`DISCORD CHANNEL: ${discordChannelMatches}`);
			discordChannel = '<' + discordChannelMatches[1] + '>';
		}

		// CUSTOM ROLES ARE IN BETWEEN $$
		const rolesMatches = String(args).match(/\$(.*?)\$/);
		let roles = [];
		if (rolesMatches) {
			const rolesAsString = rolesMatches[1];
			const allRoles = rolesAsString.split(',');
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
			.addField(`1. ${newET.role1Name}`, 'Empty')
			.addField(`2. ${newET.role2Name}`, 'Empty')
			.addField(`3. ${newET.role3Name}`, 'Empty')
			.addField(`4. ${newET.role4Name}`, 'Empty')
			.addField(`5. ${newET.role5Name}`, 'Empty');

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
	addETUser: function(message, args) {
		const role = args[2];
		const user = args[3];

		// logger.debug('role: ' + role);
		// logger.debug('user: ' + user);
		if (role !== undefined && user !== undefined) {
			const etName = args[1];
			const etParty = DB.findET(etName);

			if (etParty !== null) {
				const userTagMatches = String(args).match(/\<\@(.*?)\>/);
				let userId;
				if (userTagMatches) {
					// logger.debug(`USER ID FROM TAG: ${userTagMatches}`);
					userId = userTagMatches[1];
				}

				if (userId !== null) {
					switch(role) {
					case '1':
						etParty.role1User = userId;
						break;
					case '2':
						etParty.role2User = userId;
						break;
					case '3':
						etParty.role3User = userId;
						break;
					case '4':
						etParty.role4User = userId;
						break;
					case '5':
						etParty.role5User = userId;
						break;
					}

					const newET = DB.updateET(etParty);
					const embed = new Discord.RichEmbed()
						.setTitle(`ET ID:${newET.name} [${newET.date}] (${newET.romChannel})`)
						.setColor(newET.color)
						.setDescription(`${newET.discordChannel}`)
						.addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : '<@' + newET.role1User + '>')
						.addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : '<@' + newET.role2User + '>')
						.addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : '<@' + newET.role3User + '>')
						.addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : '<@' + newET.role4User + '>')
						.addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : '<@' + newET.role5User + '>');
					// message.channel.send(embed);

					message.channel.send(embed).then(msg => {
						if (newET.role1User !== null && newET.role2User !== null && newET.role3User !== null && newET.role4User !== null && newET.role5User !== null) {
							// logger.info('Saved discord ID: ' + newET.discordChannel);
							const discordChannelMatch = String(newET.discordChannel).match(/\<\#(.*?)\>/);
							if (discordChannelMatch) {
								const chanId = String(discordChannelMatch[1]);
								// logger.info(`Channel ID: ${chanId}`);
								bot.channels.get(chanId).send(embed);
								bot.channels.get(chanId).send('Full party moved here.');
								msg.delete(2000)
									.then(message.channel.send(`Full party ${newET.name} moved to ${newET.discordChannel}`));
							}
						}
					});
				}
			} else {
				message.channel.send('ET Party not found.');
			}
		} else {
			message.channel.send('Command not used correctly. Please check that role number is 1-5 and also tag the user accordingly.');
		}
	},
	joinET: function(message, args) {
		const role = args[2];

		if (!role) {
			message.channel.send('Please specify your role. Use number from 1-5');
			return;
		}

		const etName = args[1];
		let etParty = DB.findET(etName);

		if (etParty !== null) {
			// logger.info(`ET: ${etParty}`);
			let canJoin = false;
			let duplicate = false;

			if (role === 'PRIEST') {
				canJoin = true;
				if (etParty.role1Name === role) {
					etParty.role1User = message.author.id;
					etParty.role1Alt = true;
				}

				if (etParty.role2Name === role) {
					etParty.role2User = message.author.id;
					etParty.role2Alt = true;
				}

				if (etParty.role2Name === role) {
					etParty.role2User = message.author.id;
					etParty.role2Alt = true;
				}

				if (etParty.role2Name === role) {
					etParty.role2User = message.author.id;
					etParty.role2Alt = true;
				}

				if (etParty.role2Name === role) {
					etParty.role2User = message.author.id;
					etParty.role2Alt = true;
				}
			} else {
				if (etParty.role1Name !== null && role === '1') {
					if (etParty.role1User === null) {
						etParty.role1User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send('Sorry you cannot just replace someone like that.');
						return;
					}

					if (etParty.role2User === message.author.id || etParty.role3User === message.author.id || etParty.role4User === message.author.id
					|| etParty.role5User === message.author.id) {
						duplicate = true;
					}
				}

				if (etParty.role2Name !== null && role === '2') {
					if (etParty.role2User === null) {
						etParty.role2User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send('Sorry you cannot just replace someone like that.');
						return;
					}

					if (etParty.role1User === message.author.id || etParty.role3User === message.author.id || etParty.role4User === message.author.id
					|| etParty.role5User === message.author.id) {
						duplicate = true;
					}
				}

				if (etParty.role3Name !== null && role === '3') {
					if (etParty.role3User === null) {
						etParty.role3User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send('Sorry you cannot just replace someone like that.');
						return;
					}

					if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role4User === message.author.id
					|| etParty.role5User === message.author.id) {
						duplicate = true;
					}
				}

				if (etParty.role4Name !== null && role === '4') {
					if (etParty.role4User === null) {
						etParty.role4User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send('Sorry you cannot just replace someone like that.');
						return;
					}

					if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role3User === message.author.id
					|| etParty.role5User === message.author.id) {
						duplicate = true;
					}
				}

				if (etParty.role5Name !== null && role === '5') {
					if (etParty.role5User === null) {
						etParty.role5User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send('Sorry you cannot just replace someone like that.');
						return;
					}
					if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role3User === message.author.id
					|| etParty.role4User === message.author.id) {
						duplicate = true;
					}
				}
			}

			if (canJoin && !duplicate) {
				// logger.info('can join & not duplicate');
				let newET = DB.updateET(etParty);
				message.channel.send(`<@${message.author.id}> just joined ${etName}`)
					.then(msg => {
						setTimeout(function () {
							// msg.delete()
						}, 15000);
					});

				const embed = new Discord.RichEmbed()
					.setTitle(`ET ID:${newET.name} [${newET.date}] (${newET.romChannel})`)
					.setColor(newET.color)
					.setDescription(`${newET.discordChannel}`)
					.addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : '<@' + newET.role1User + '>')
					.addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : '<@' + newET.role2User + '>')
					.addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : '<@' + newET.role3User + '>')
					.addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : '<@' + newET.role4User + '>')
					.addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : '<@' + newET.role5User + '>');

				message.channel.send(embed).then(msg => {
					// if (newET.role1User !== null) { testing purpose
					if (newET.role1User !== null && newET.role2User !== null && newET.role3User !== null && newET.role4User !== null && newET.role5User !== null) {
						// logger.info('Saved discord ID: ' + newET.discordChannel);
						const discordChannelMatch = String(newET.discordChannel).match(/\<\#(.*?)\>/);
						if (discordChannelMatch) {
							const chanId = String(discordChannelMatch[1]);
							logger.info(`Channel ID: ${chanId}`);
							bot.channels.get(chanId).send(embed);
							msg.delete(2000)
								.then(message.channel.send(`Full party ${newET.name} moved to ${newET.discordChannel}`));
						}
					}
				});
			} else if (duplicate) {
				// logger.info('duplicate');
				message.channel.send(`OMG ${message.author.username}! You already joined.`);
			} else if (!etParty.queue.includes(message.author.id)) {
				// logger.info('not in queue');
				etParty.queue.push(message.author.id);
				const newET = DB.updateET(etParty);
				let queueText;

				newET.queue.forEach(id => {
					queueText += `<@${id}> `;
				});
				const embed = new Discord.RichEmbed()
					.setTitle(`ET ID:${newET.name} [${newET.date}] (${newET.romChannel})`)
					.setColor(newET.color)
					.setDescription(`${newET.discordChannel}`)
					.addField(`1. ${newET.role1Name}`, newET.role1User === null ? 'Empty' : newET.role1User)
					.addField(`2. ${newET.role2Name}`, newET.role2User === null ? 'Empty' : newET.role2User)
					.addField(`3. ${newET.role3Name}`, newET.role3User === null ? 'Empty' : newET.role3User)
					.addField(`4. ${newET.role4Name}`, newET.role4User === null ? 'Empty' : newET.role4User)
					.addField(`5. ${newET.role5Name}`, newET.role5User === null ? 'Empty' : newET.role5User)
					.addField('Queue', `${queueText}`);

				message.channel.send(embed);
				message.channel.send(`Sorry ${message.author.username} all slots are taken. You have been added as to queue.`);
			} else {
				// logger.info('in queue');
				message.channel.send('You are already in queue.');
			}

		} else {
			message.channel.send(`Cannot join party. No ET Party found for ID: ${etName}`);
		}
	},
	leaveETParty: function(message, args) {
		const etName = args[1];
		let et = DB.findET(etName);
		const reasonMatches = String(args).match(/\((.*?)\)/);
		let reason = 'N/A';
		if (reasonMatches) {
			reason = reasonMatches[1].replace(new RegExp(',', 'g'), ' ');
		}

		if (et !== null) {
			if (et.role1User && et.role1User === message.author.id) {
				et.role1User = null;
			}

			if (et.role2User && et.role2User === message.author.id) {
				et.role2User = null;
			}

			if (et.role3User && et.role3User === message.author.id) {
				et.role3User = null;
			}

			if (et.role4User && et.role4User === message.author.id) {
				et.role4User = null;
			}

			if (et.role5User && et.role5User === message.author.id) {
				et.role5User = null;
			}

			DB.updateET(et);
			message.channel.send(`<@${message.author.id}> has left ${etName} reason: ${reason}`);
		} else {
			message.channel.send('Party not found please check ID again.');
		}
	},
	deleteETParty: function(message, args) {
		// const etName = args[1];
		const etNameInput = args.splice(1);
		// logger.debug("etNameInput: " + etNameInput);

		etNameInput.forEach(function(etName) {
		// logger.debug("etName: " + etName);
			const et = DB.findET(etName);
			if (et !== null) {
				if (et.createdBy === message.author.id || message.member.roles.find(r => r.name === 'Admin')
					|| message.member.roles.find(r => r.name === 'D.Moderator')
					|| message.member.roles.find(r => r.name === 'Core')) {
					DB.deleteET(etName);
					message.channel.send(`ET party with ID: ${etName} was deleted by <@${message.author.id}>`);
				} else {
					message.channel.send('Sorry you cannot delete party created by others');
				}
			}
		});
	},
	showMyETs: function(message) {
		const results = DB.findMyETs(message.author.id);
		message.channel.send(`You have joined ${results.length} ET parties`)
			.then(msg => {
			// setTimeout(function () {
			//     msg.delete();
			// }, 5000)
			});

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
				.setAuthor(`${bot.users.get(et.createdBy).username}`, `${bot.users.get(et.createdBy).avatarURL}`);
			message.channel.send(embed);
		});
	},
};