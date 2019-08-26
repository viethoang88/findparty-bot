const varFile = require('../variables/var.js');
const Discord = require('discord.js');
const logger = require('winston');

const bot = varFile.bot;
const DB = varFile.DB;
const prefix = varFile.CMD_PREFIX;
const ET_TYPE = varFile.ET_TYPE;
const AUTO_DELETE_MODE = varFile.AUTO_DELETE_MODE;
const AUTO_DELETE_TIME = varFile.AUTO_DELETE_TIME;

module.exports = {
	showHelp: function(message) {
		const helpEmbed = new Discord.RichEmbed()
			.setTitle(`User manual for creating and finding party`)
			.setDescription(`Please follow the instructions and use the correct brackets as below. Please use commands carefully, bot is fragile :)`)
			// .addField(`List out all ET parties or specific party (coming soon)`,
			// 	`Command: ${prefix}list ET or ${prefix}list ET ID\n` +
			// 	`Example: ${prefix}list ET se42GD\n`)
			.addField(`List out all ET parties`,
				`Command: ${prefix}list ET`)
			.addField(`Create ET party`,
				`Simple Command: ${prefix}create ET [date and time] (ROM Channel) #discord-channel\n` +
				`Example: ${prefix}create ET [19 May 16:30] (EN14) #et-1\n` +
				`---\n` +
				`Full Command: ${prefix}create ET :PartyID: [date and time] (ROM Channel) #discord-channel $CUSTOM ROLES$\n` +
				`Example: ${prefix}create ET :AwesomeParty: [19 May 16:30] (EN14) #et-1 $TANK PRIEST DPS DPS WIZ$\n` +
				`---\n` +
				`Notes: \n` +
				`- Make sure the discord channel exists and starts with # symbol.\n` +
				`- Date in [] brackets will be displayed as you enter there is no processing done on date/time/timezone\n` +
				`- $Roles$ are optional. If you don\'t specify, roles will be automatically set to TANK PRIEST DPS DPS DPS\n` +
				`- :PartyID: is optional. If you don\'t specify, a 5 character ID will be generated and you can use it in other commands. \n`)
			.addField(`Join ET party`,
				`Command: ${prefix}join ET ID slot#\n` +
				`Example: ${prefix}join ET se42GD 2`)
			.addField(`Add others to ET party`,
				`Command: ${prefix}add ET ID slot# @person\n` +
				`Example: ${prefix}add ET 12345 1 @Shelli`)
			.addField(`Adding an alt/slave to ET Party`,
				`Command: ${prefix}add ET ID slot# @person alt\n` +
				`Example: ${prefix}add ET 12345 1 @Shelli alt`)
			.addField(`Replacing others in ET party`,
				`Command: ${prefix}replace ET ID slot# @person\n` +
				`Example: ${prefix}replace ET 12345 1 @SilvStar`)
			.addField(`Replacing others with an alt/slave in ET party`,
				`Command: ${prefix}replace ET ID slot# @person alt\n` +
				`Example: ${prefix}replace ET 12345 1 @SilvStar alt`)
			.addField(`Remove someone from ET party`,
				`Command: ${prefix}remove ET ID slot#\n` +
				`Example: ${prefix}remove ET 12345 1`)
			.addField(`Leave ET party`,
				`Command: ${prefix}leave ET ID (reason)\n` +
				`Example: ${prefix}leave ET 12345 (Sick)`)
			.addField('Move a semi-filled party to channel and remove from List',
				'Command: ${prefix}move ET ID\n' +
				'Example: ${prefix}move ET 12345\n' +
				`Notes: Only creator of party or person with permissions can move the party.`)
			.addField(`Delete ET party`,
				`Command: ${prefix}delete ET ID\n` +
				`Example: ${prefix}delete ET 12345 09876\n` +
				`Notes: Only creator of party or person with permissions can delete party.`)
			.addField('List out the parties you are in',
				`Command: ${prefix}my ET\n`)
			.setFooter('By our very own FF Entourage team', 'https://cdn.discordapp.com/icons/566782560294928385/3736129398539082770518dc5278911d.png');
		// message.author.send(helpEmbed)
		// 	.then(() => {
		// 		if (message.channel.type === 'dm') return;
		// 	})
		// 	.catch(error => {
		// 		console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
		// 	});
		return helpEmbed;
	},
	isDefined: function(variable) {
		if (typeof variable === 'undefined' || variable === null) {
			return false;
		} else {
			return true;
		}
	},
	displayLFPETResults: function(message, results) {
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
		

		results.forEach(et => {
			if (et.status === "OPEN") {
				this.displayLFPResult(message, et, ET_TYPE);
			}
		});
	},
	displayLFPResult: function(message, result, type) {
		const embed = this.getEmbed(result, type);
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
	displayLFPResultNoNotif: function(message, result, type) {
		const embed = this.getEmbedNoNotif(result, type);
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
				.setAuthor(`${bot.users.get(model.createdBy).username}`, `${bot.users.get(model.createdBy).displayAvatarURL}`);
				if (model.role1Alt) {
					embed.addField(`1. ${model.role1Name}`, model.role1User === null ? `Empty` : `<@${model.role1User}> - ALT/Slave`);
				} else {
					embed.addField(`1. ${model.role1Name}`, model.role1User === null ? `Empty` : `<@${model.role1User}> - Main`)
				}

				if (model.role2Alt) {
					embed.addField(`2. ${model.role2Name}`, model.role2User === null ? `Empty` : `<@${model.role2User}> - ALT/Slave`);
				} else {
					embed.addField(`2. ${model.role2Name}`, model.role2User === null ? `Empty` : `<@${model.role2User}> - Main`)
				}

				if (model.role3Alt) {
					embed.addField(`3. ${model.role3Name}`, model.role3User === null ? `Empty` : `<@${model.role3User}> - ALT/Slave`);
				} else {
					embed.addField(`3. ${model.role3Name}`, model.role3User === null ? `Empty` : `<@${model.role3User}> - Main`)
				}

				if (model.role4Alt) {
					embed.addField(`4. ${model.role4Name}`, model.role4User === null ? `Empty` : `<@${model.role4User}> - ALT/Slave`);
				} else {
					embed.addField(`4. ${model.role4Name}`, model.role4User === null ? `Empty` : `<@${model.role4User}> - Main`)
				}

				if (model.role5Alt) {
					embed.addField(`5. ${model.role5Name}`, model.role5User === null ? `Empty` : `<@${model.role5User}> - ALT/Slave`);
				} else {
					embed.addField(`5. ${model.role5Name}`, model.role5User === null ? `Empty` : `<@${model.role5User}> - Main`)
				}

				if (model.role6Alt) {
					embed.addField(`6. ${model.role6Name}`, model.role6User === null ? `Empty` : `<@${model.role6User}> - ALT/Slave`);
				} else {
					embed.addField(`6. ${model.role6Name}`, model.role6User === null ? `Empty` : `<@${model.role6User}> - Main`)
				}
			return embed;
		} else {
			return null;
		}
	},
	getEmbedNoNotif: function(model, type) {
		if (type === ET_TYPE) {
			const embed = new Discord.RichEmbed()
				.setTitle(`ET ID: ${model.name} | [${model.date}] (${model.romChannel})`)
				.setColor(model.color)
				.setDescription(`${model.discordChannel}`)
				.setAuthor(`${bot.users.get(model.createdBy).username}`, `${bot.users.get(model.createdBy).displayAvatarURL}`);
				if (model.role1Alt) {
					embed.addField(`1. ${model.role1Name}`, model.role1User === null ? `Empty` : `${bot.users.get(model.role1User).tag} - ALT/Slave`);
				} else {
					embed.addField(`1. ${model.role1Name}`, model.role1User === null ? `Empty` : `${bot.users.get(model.role1User).tag} - Main`)
				}

				if (model.role2Alt) {
					embed.addField(`2. ${model.role2Name}`, model.role2User === null ? `Empty` : `${bot.users.get(model.role2User).tag} - ALT/Slave`);
				} else {
					embed.addField(`2. ${model.role2Name}`, model.role2User === null ? `Empty` : `${bot.users.get(model.role2User).tag} - Main`)
				}

				if (model.role3Alt) {
					embed.addField(`3. ${model.role3Name}`, model.role3User === null ? `Empty` : `${bot.users.get(model.role3User).tag} - ALT/Slave`);
				} else {
					embed.addField(`3. ${model.role3Name}`, model.role3User === null ? `Empty` : `${bot.users.get(model.role3User).tag} - Main`)
				}

				if (model.role4Alt) {
					embed.addField(`4. ${model.role4Name}`, model.role4User === null ? `Empty` : `${bot.users.get(model.role4User).tag} - ALT/Slave`);
				} else {
					embed.addField(`4. ${model.role4Name}`, model.role4User === null ? `Empty` : `${bot.users.get(model.role4User).tag} - Main`)
				}

				if (model.role5Alt) {
					embed.addField(`5. ${model.role5Name}`, model.role5User === null ? `Empty` : `${bot.users.get(model.role5User).tag} - ALT/Slave`);
				} else {
					embed.addField(`5. ${model.role5Name}`, model.role5User === null ? `Empty` : `${bot.users.get(model.role5User).tag} - Main`)
				}

				if (model.role6Alt) {
					embed.addField(`6. ${model.role6Name}`, model.role6User === null ? `Empty` : `${bot.users.get(model.role6User).tag} - ALT/Slave`);
				} else {
					embed.addField(`6. ${model.role6Name}`, model.role6User === null ? `Empty` : `${bot.users.get(model.role6User).tag} - Main`)
				}
			return embed;
		} else {
			return null;
		}
	},
	lfmET: function(message, args) {
		const etName = args[1];
		const etParty = DB.findET(etName);

		var tags = '';

		if (etParty.role1User !== null && etParty.role2User !== null && etParty.role3User !== null && etParty.role4User !== null && etParty.role5User !== null && etParty.role6User !== null) {
			// PARTY IS FULL 
			message.reply(`Party is already full.`)
			return 
		} else {
			if (etParty.status != 'OPEN') {
				etParty.status = 'OPEN'
				DB.updateET(etParty)
			}
		}

		if (etParty != null) {
			if ((etParty.role1Name === "ANY" && etParty.role1User === null) || (etParty.role2Name === "ANY" && etParty.role2User === null) || (etParty.role3Name === "ANY" && etParty.role3User === null)
			|| (etParty.role4Name === "ANY" && etParty.role4User === null) || (etParty.role5Name === "ANY" && etParty.role5User === null) || (etParty.role6Name === "ANY" && etParty.role6User === null)) {
				tags += `<@&${varFile.TANK_ROLE_ID}>, <@&${varFile.HEALS_ROLE_ID}>, <@&${varFile.WIZ_ROLE_ID}>, <@&${varFile.RANGE_DPS_ROLE_ID}>, <@&${varFile.MEELEE_DPS_ROLE_ID}>`
				message.channel.send(tags)
				return 
			}

			if ((etParty.role1Name === "TANK" && etParty.role1User === null) || (etParty.role2Name === "TANK" && etParty.role2User === null) || (etParty.role3Name === "TANK" && etParty.role3User === null)
			|| (etParty.role4Name === "TANK" && etParty.role4User === null) || (etParty.role5Name === "TANK" && etParty.role5User === null) || (etParty.role6Name === "TANK" && etParty.role6User === null)) {
				if (tags.length == 0) {
					tags += `<@&${varFile.TANK_ROLE_ID}>`
				} else {
					tags += `, <@&${varFile.TANK_ROLE_ID}>`
				}
			}

			if ((etParty.role1Name === "PRIEST" && etParty.role1User === null) || (etParty.role2Name === "PRIEST" && etParty.role2User === null) || (etParty.role3Name === "PRIEST" && etParty.role3User === null)
			|| (etParty.role4Name === "PRIEST" && etParty.role4User === null) || (etParty.role5Name === "PRIEST" && etParty.role5User === null) || (etParty.role6Name === "PRIEST" && etParty.role6User === null)) {
				if (tags.length == 0) {
					tags += `<@&${varFile.HEALS_ROLE_ID}>`
				} else {
					tags += `, <@&${varFile.HEALS_ROLE_ID}>`
				}
			}

			if ((etParty.role1Name === "DPS" && etParty.role1User === null) || (etParty.role2Name === "DPS" && etParty.role2User === null) || (etParty.role3Name === "DPS" && etParty.role3User === null)
			|| (etParty.role4Name === "DPS" && etParty.role4User === null) || (etParty.role5Name === "DPS" && etParty.role5User === null) || (etParty.role6Name === "DPS" && etParty.role6User === null)) {
				if (tags.length == 0) {
					tags += `<@&${varFile.MEELEE_DPS_ROLE_ID}>, <@&${varFile.RANGE_DPS_ROLE_ID}>, <@&${varFile.WIZ_ROLE_ID}>`
				} else {
					tags += `, <@&${varFile.MEELEE_DPS_ROLE_ID}>, <@&${varFile.RANGE_DPS_ROLE_ID}>, <@&${varFile.WIZ_ROLE_ID}>`
				}
			}

			if (tags.indexOf(varFile.WIZ_ROLE_ID) == -1) {
				if ((etParty.role1Name === "WIZ" && etParty.role1User === null) || (etParty.role2Name === "WIZ" && etParty.role2User === null) || (etParty.role3Name === "WIZ" && etParty.role3User === null)
				|| (etParty.role4Name === "WIZ" && etParty.role4User === null) || (etParty.role5Name === "WIZ" && etParty.role5User === null) || (etParty.role6Name === "WIZ" && etParty.role6User === null)) {
					if (tags.length == 0) {
						tags += `<@&${varFile.WIZ_ROLE_ID}>`
					} else {
						tags += `, <@&${varFile.WIZ_ROLE_ID}>`
					}
				}
			}
			const embed = module.exports.getEmbed(etParty, ET_TYPE)
			embed.addField('Our party is looking for', tags)
			message.channel.send(embed)
		}
	},
	addETUser: function(message, args) {
		const role = args[2];
		const user = args[3];
		const alt = args[4];

		// logger.debug(`role: ` + role);
		// logger.debug(`user: ` + user);
		if (role != null && role != undefined && user != null && user != undefined && user.indexOf('undefined')) {
			const etName = args[1];
			const etParty = DB.findET(etName);
			// logger.debug(`etName: ` + etName);
			// logger.debug(`etParty: ` + etParty);

			if (etParty !== null) {
				const userTagMatches = String(args).replace('\!', '').match(/\<\@(.*?)\>/);
				let userId;
				if (userTagMatches) {
					// logger.debug(`USER ID FROM TAG: ${userTagMatches}`);
					userId = userTagMatches[1];
				}

				var duplicate = false;
				if (etParty.role1User == userId || etParty.role2User == userId || etParty.role3User == userId || etParty.role4User == userId
					|| etParty.role5User == userId || etParty.role6User == userId) {
					duplicate = true;
				}

				if (alt !== null || alt !== undefined) {
					duplicate = false
				}

				if (duplicate) {
					message.channel.send(`Sorry <@${userId}> already joined.`);
					return
				}

				if (userId !== null) {
					switch(role) {
					case `1`:
						etParty.role1User = userId;
						if (alt != null || alt != undefined) {
							etParty.role1Alt = true
						}
						break;
					case `2`:
						etParty.role2User = userId;
						if (alt != null || alt != undefined) {
							etParty.role2Alt = true
						}
						break;
					case `3`:
						etParty.role3User = userId;
						if (alt != null || alt != undefined) {
							etParty.role3Alt = true
						}
						break;
					case `4`:
						etParty.role4User = userId;
						if (alt != null || alt != undefined) {
							etParty.role4Alt = true
						}
						break;
					case `5`:
						etParty.role5User = userId;
						if (alt != null || alt != undefined) {
							etParty.role5Alt = true
						}
						break;
					case `6`:
						etParty.role6User = userId;
						if (alt != null || alt != undefined) {
							etParty.role6Alt = true
						}
						break;
					}

					const newET = DB.updateET(etParty);
					const embed = module.exports.getEmbed(newET, ET_TYPE)
					message.channel.send(embed).then(msg => {
						if (newET.role1User !== null && newET.role2User !== null && newET.role3User !== null && newET.role4User !== null && newET.role5User !== null && newET.role6User !== null) {
							// logger.info(`Saved discord ID: ` + newET.discordChannel);
							newET.status = "FULL"
							DB.updateET(newET)
							const discordChannelMatch = String(newET.discordChannel).match(/\<\#(.*?)\>/);
							if (discordChannelMatch) {
								const chanId = String(discordChannelMatch[1]);
								// logger.info(`Channel ID: ${chanId}`);
								bot.channels.get(chanId).send(embed);
								bot.channels.get(chanId).send(`Full party moved here.`);
								msg.delete(2000)
									.then(message.channel.send(`Full party ${newET.name} moved to ${newET.discordChannel}`));
							}
						}
					});
				}
			} else {
				message.channel.send(`ET Party not found.`);
			}
		} else {
			message.channel.send(`Command not used correctly. Please check that PartyID is included, role number is 1-6 and also tag the user accordingly.`);
		}
	},
	removeETUser: function(message, args) {
		const role = args[2];
		// const user = args[3];

		// logger.debug(`role: ` + role);
		// logger.debug(`user: ` + user);
		if (role !== null && role !== undefined) {
			const etName = args[1];
			const etParty = DB.findET(etName);

			if (etParty !== null) {
				switch(role) {
				case `1`:
					etParty.role1User = null;
					etParty.role1Alt = false;
					break;
				case `2`:
					etParty.role2User = null;
					etParty.role2Alt = false;
					break;
				case `3`:
					etParty.role3User = null;
					etParty.role3Alt = false;
					break;
				case `4`:
					etParty.role4User = null;
					etParty.role4Alt = false;
					break;
				case `5`:
					etParty.role5User = null;
					etParty.role5Alt = false;
					break;
				case `6`:
					etParty.role6User = null;
					etParty.role6Alt = false;
					break;
				}

				const newET = DB.updateET(etParty);
				const embed = module.exports.getEmbed(newET, ET_TYPE)
				message.channel.send(embed).then(msg => {
					
				});
			} else {
				message.channel.send(`No ET Party found for ID: ${etName}`);
			}
		} else {
			message.channel.send('Please check that PartyID & Slot# are stated in your command. E.g. ' + prefix + 'remove ET **12345 2**');
		}
	},
	joinET: function(message, args) {
		const role = args[2];

		if (!role) {
			message.channel.send(`Please specify your role. Use number from 1-6`);
			return;
		}

		const etName = args[1];
		let etParty = DB.findET(etName);

		if (etParty !== null) {
			// logger.info(`ET: ${etParty}`);
			let canJoin = false;
			let duplicate = false;

			if (role === `PRIEST`) {
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
				if (etParty.role1Name !== null && role === `1`) {
					if (etParty.role1User === null) {
						etParty.role1User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send(`Sorry you cannot just replace someone like that.`);
						return;
					}

					// if (etParty.role2User === message.author.id || etParty.role3User === message.author.id || etParty.role4User === message.author.id
					// || etParty.role5User === message.author.id || etParty.role6User === message.author.id) {
					// 	duplicate = true;
					// }
				}

				if (etParty.role2Name !== null && role === `2`) {
					if (etParty.role2User === null) {
						etParty.role2User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send(`Sorry you cannot just replace someone like that.`);
						return;
					}

					// if (etParty.role1User === message.author.id || etParty.role3User === message.author.id || etParty.role4User === message.author.id
					// || etParty.role5User === message.author.id || etParty.role6User === message.author.id) {
					// 	duplicate = true;
					// }
				}

				if (etParty.role3Name !== null && role === `3`) {
					if (etParty.role3User === null) {
						etParty.role3User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send(`Sorry you cannot just replace someone like that.`);
						return;
					}

					// if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role4User === message.author.id
					// || etParty.role5User === message.author.id || etParty.role6User === message.author.id) {
					// 	duplicate = true;
					// }
				}

				if (etParty.role4Name !== null && role === `4`) {
					if (etParty.role4User === null) {
						etParty.role4User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send(`Sorry you cannot just replace someone like that.`);
						return;
					}

					// if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role3User === message.author.id
					// || etParty.role5User === message.author.id) {
					// 	duplicate = true;
					// }
				}

				if (etParty.role5Name !== null && role === `5`) {
					if (etParty.role5User === null) {
						etParty.role5User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send(`Sorry you cannot just replace someone like that.`);
						return;
					}
					// if (etParty.role1User === message.author.id || etParty.role2User === message.author.id || etParty.role3User === message.author.id
					// || etParty.role4User === message.author.id) {
					// 	duplicate = true;
					// }
				}

				if (etParty.role6Name !== null && role === `6`) {
					if (etParty.role6User === null) {
						etParty.role6User = message.author.id;
						canJoin = true;
					} else {
						message.channel.send(`Sorry you cannot just replace someone like that.`);
						return;
					}
				}
			}

			// if (canJoin && !duplicate) {
			if (canJoin) {
				// logger.info(`can join & not duplicate`);
				let newET = DB.updateET(etParty);
				message.channel.send(`<@${message.author.id}> just joined ${etName}`)
					.then(msg => {
						setTimeout(function () {
							// msg.delete()
						}, 15000);
					});

				const embed = module.exports.getEmbed(newET, ET_TYPE)

				message.channel.send(embed).then(msg => {
					// if (newET.role1User !== null) { testing purpose
					if (newET.role1User !== null && newET.role2User !== null && newET.role3User !== null && newET.role4User !== null && newET.role5User !== null && newET.role6User !== null) {
						// logger.info(`Saved discord ID: ` + newET.discordChannel);
						newET.status = "FULL"
						DB.updateET(etParty)
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
			// } else if (duplicate) {
				// logger.info(`duplicate`);
				// message.channel.send(`OMG ${message.author.username}! You already joined.`);
			} else if (!etParty.queue.includes(message.author.id)) {
				// logger.info(`not in queue`);
				etParty.queue.push(message.author.id);
				const newET = DB.updateET(etParty);
				let queueText;

				newET.queue.forEach(id => {
					queueText += `<@${id}> `;
				});
				const embed = module.exports.getEmbed(newET, ET_TYPE)

				message.channel.send(embed);
				message.channel.send(`Sorry ${message.author.username} all slots are taken. You have been added as to queue.`);
			} else {
				// logger.info(`in queue`);
				message.channel.send(`You are already in queue.`);
			}

		} else {
			message.channel.send(`Cannot join party. No ET Party found for ID: ${etName}`);
		}
	},
	replaceETrole: function(message, args) {
		const role = args[2];
		const discordUserMatches = String(args[3]).match(/\<\@(.*?)\>/);
		let user;
		const alt = args[4];
		if (discordUserMatches) {
			// logger.debug(`DISCORD CHANNEL: ${discordUserMatches}`);
			user = discordUserMatches[1];
		}

		if (role !== null && user !== null && role !== undefined && user !== undefined) {
			const etName = args[1];
			const etParty = DB.findET(etName);

			if (etParty !== null) {
				// logger.info(`User: ${user}`);
				var previousUser;
				var previousRoleName;

				var duplicate = false;
				// if (etParty.role1User === user || etParty.role2User === user || etParty.role3User === user || etParty.role4User === user
				// 	|| etParty.role5User === user || etParty.role6User === user) {
				// 	duplicate = true;
				// }

				// if (duplicate) {
				// 	message.channel.send(`Sorry <@${user}> already joined.`);
				// 	return;
				// }

				if (etParty.role1Name !== null && role === '1') {
					previousUser = etParty.role1User;
					previousRoleName = etParty.role1Name;
					etParty.role1User = user;
					if (alt != null || alt != undefined) {
						etParty.role1Alt = true
					}
				}

				if (etParty.role2Name !== null && role === '2') {
					previousUser = etParty.role2User;
					previousRoleName = etParty.role2Name;
					etParty.role2User = user;
					if (alt != null || alt != undefined) {
						etParty.role2Alt = true
					}
				}

				if (etParty.role3Name !== null && role === '3') {
					previousUser = etParty.role3User;
					previousRoleName = etParty.role3Name;
					etParty.role3User = user;
					if (alt != null || alt != undefined) {
						etParty.role3Alt = true
					}
				}

				if (etParty.role4Name !== null && role === '4') {
					previousUser = etParty.role4User;
					previousRoleName = etParty.role4Name;
					etParty.role4User = user;
					if (alt != null || alt != undefined) {
						etParty.role4Alt = true
					}
				}

				if (etParty.role5Name !== null && role === '5') {
					previousUser = etParty.role5User;
					previousRoleName = etParty.role5Name;
					etParty.role5User = user;
					if (alt != null || alt != undefined) {
						etParty.role5Alt = true
					}
				}

				if (etParty.role6Name !== null && role === '6') {
					previousUser = etParty.role6User;
					previousRoleName = etParty.role6Name;
					etParty.role6User = user;
					if (alt != null || alt != undefined) {
						etParty.role6Alt = true
					}
				}

				let newET = DB.updateET(etParty);
				const embed = module.exports.getEmbed(newET, ET_TYPE)

				message.channel.send(embed).then(msg => {
					message.channel.send(`${previousRoleName}: <@${previousUser}> was replaced by <@${user}>`)

					// if (newET.role1User !== null) { testing purpose
					if (newET.role1User !== null && newET.role2User !== null && newET.role3User !== null && newET.role4User !== null && newET.role5User !== null && newET.role6User !== null) {
						// logger.info(`Saved discord ID: ` + newET.discordChannel);
						newET.status = "FULL"
						DB.updateET(ET)
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
			} else {
				message.channel.send(`No ET Party found for ID: ${etName}`);
			}
		} else {
			message.channel.send('Please check that PartyID, Slot# and User are stated in your command. E.g. ' + prefix + 'replace ET **12345 2 @SilvStar**');
		}
	},
	leaveParty: function(message, args) {
		const instance = args[0];
		const partyName = args[1];
		const reasonMatches = String(args).match(/\((.*?)\)/);
		let reason = `N/A`;
		if (reasonMatches) {
			reason = reasonMatches[1].replace(new RegExp(`,`, `g`), ` `);
		}

		switch(instance.toLowerCase()) {
		case ET_TYPE:
			let et = DB.findET(partyName);
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

				if (et.role6User && et.role6User === message.author.id) {
					et.role6User = null;
				}

				if (et.status === "FULL") {
					et.status = "OPEN"
				}

				DB.updateET(et);
				message.channel.send(`<@${message.author.id}> has left ${partyName} reason: ${reason}`);
			} else {
				message.channel.send(`Party not found please check ID again.`);
			}
			break;
		default:
			// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'leave **ET** PartyID (reason).');
			break;
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
				if (et.createdBy === message.author.id || message.member.roles.find(r => r.name === `Admin`)
					|| message.member.roles.find(r => r.name === `D.Moderator`)
					|| message.member.roles.find(r => r.name === `Core`)) {
					DB.deleteET(etName);
					message.channel.send(`ET party with ID: ${etName} was deleted by <@${message.author.id}>`);
				} else {
					message.channel.send(`Sorry you cannot delete party created by others`);
				}
			}
		});
	},
	moveET: function(message, args) {
		// const etName = args[1];
		if (args[1] == null || args[1] == undefined){
			return message.channel.send('Please specify ET Party ID in your commands.');
		}
		const etNameInput = args.splice(1);

		etNameInput.forEach(function(etName) {
		// logger.debug("etName: " + etName);
			const et = DB.findET(etName);
			if (et !== null) {
				if (et.createdBy === message.author.id || message.member.roles.find(r => r.name === `Admin`)
					|| message.member.roles.find(r => r.name === `D.Moderator`)
					|| message.member.roles.find(r => r.name === `Core`)) {
					et.status = "FULL"
					var newET = DB.updateET(et)
					const embed = new Discord.RichEmbed()
						.setTitle(`ET ID:${newET.name} [${newET.date}] (${newET.romChannel})`)
						.setColor(newET.color)
						.setDescription(`${newET.discordChannel}`)
						if (newET.role1Alt) {
							embed.addField(`1. ${newET.role1Name}`, newET.role1User === null ? `Empty` : `<@${newET.role1User}> - ALT/Slave`)
						} else {
							embed.addField(`1. ${newET.role1Name}`, newET.role1User === null ? `Empty` : `<@${newET.role1User}> - Main`)
						}
	
						if (newET.role2Alt) {
							embed.addField(`2. ${newET.role2Name}`, newET.role2User === null ? `Empty` : `<@${newET.role2User}> - ALT/Slave`)
						} else {
							embed.addField(`2. ${newET.role2Name}`, newET.role2User === null ? `Empty` : `<@${newET.role2User}> - Main`)
						}
	
						if (newET.role3Alt) {
							embed.addField(`3. ${newET.role3Name}`, newET.role3User === null ? `Empty` : `<@${newET.role3User}> - ALT/Slave`)
						} else {
							embed.addField(`3. ${newET.role3Name}`, newET.role3User === null ? `Empty` : `<@${newET.role3User}> - Main`)
						}
	
						if (newET.role4Alt) {
							embed.addField(`4. ${newET.role4Name}`, newET.role4User === null ? `Empty` : `<@${newET.role4User}> - ALT/Slave`)
						} else {
							embed.addField(`4. ${newET.role4Name}`, newET.role4User === null ? `Empty` : `<@${newET.role4User}> - Main`)
						}
	
						if (newET.role5Alt) {
							embed.addField(`5. ${newET.role5Name}`, newET.role5User === null ? `Empty` : `<@${newET.role5User}> - ALT/Slave`)
						} else {
							embed.addField(`5. ${newET.role5Name}`, newET.role5User === null ? `Empty` : `<@${newET.role5User}> - Main`)
						}
	
						if (newET.role6Alt) {
							embed.addField(`6. ${newET.role6Name}`, newET.role6User === null ? `Empty` : `<@${newET.role6User}> - ALT/Slave`)
						} else {
							embed.addField(`6. ${newET.role6Name}`, newET.role6User === null ? `Empty` : `<@${newET.role6User}> - Main`)
						}
					const discordChannelMatch = String(newET.discordChannel).match(/\<\#(.*?)\>/);
					if (discordChannelMatch) {
						const chanId = String(discordChannelMatch[1]);
						if (bot.channels.get(chanId) === undefined) {
							return message.channel.send('Sorry, cannot move party as the discord channel does not exist.');
						}
						bot.channels.get(chanId).send(embed);
						message.channel.send(`Party ${newET.name} moved to ${newET.discordChannel}`).then(msg => {
							msg.delete(3000);
						})
					}
				} else {
					message.channel.send(`Sorry you cannot move this party.`);
				}
			} else {
				message.channel.send(`Cannot move party. No ET Party found for ID: ${etName}`);
			}
		});
	}
};