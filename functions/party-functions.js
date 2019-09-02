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
  //returns all available parties
  getParties: function(message) {
    parties = [];
		if(message.channel.id === varFile.BOT_CMD_ET_CHANNEL_ID) {
      var results = varFile.DB.findOpenET();
      results.forEach(party => {
        parties.push(party)
      });
    }
    return parties
  },
  //show all available parties
	showParties: async function(message, parties) {
    if(parties.length === 0) {
      message.channel.send(`No party has been created.`);
    } else {
      message.channel.send(`**There ${parties.length == 1 ? 'is' : 'are'} ${parties.length} ${parties.length == 1 ? 'party' : 'parties'}. Enter a party number to apply.**`);
      var choices = "";
      parties.forEach((party, i) => {
        if (party.status === "OPEN") {
          this.availbleRoles(party)
          choices += `**${i + 1} - ${party.name} | ${party.date} (${party.romChannel})** \n`
          choices += `\t Available Roles: ${this.availbleRoles(party).join(" | ")}\n\n`
        }
      });
    }
    msg = await message.channel.send(choices)
    if (AUTO_DELETE_MODE) {
      setTimeout(function() {
        message.delete();
        msg.delete();
      }, AUTO_DELETE_TIME);
    }
  },
  //returns party object
  getParty: function(name) {
    return DB.findET(name);
  },
  //returns all available roles in a party
  availbleRoles: function(party) {
    roles = [];
    for(i=1;i<7;i++) {
      if(party[`role${i}User`] === null) {
        roles.push(party[`role${i}Name`]);
      }
    }
    return roles;
  },
  //join specific party with role
  joinParty: async function(message, party, role) {
    if(!party || !role) {
      message.channel.send(`Please enter a valid role`)
    } else {
      if(!this.availbleRoles(party).includes(role)) {
        message.channel.send(`An error occurred while trying to join the party`)
      } else {
        for(i=1;i<7;i++) {
          if(party[`role${i}User`] === null && party[`role${i}Name`] === role) {
            party[`role${i}User`] = message.author.id;
            break;
          }
        }        
        let joinedParty = DB.updateET(party);
        msg = await message.channel.send(`<@${message.author.id}> just joined ${party.name}`)
        //setTimeout(function () {}, 15000);

        const embed = this.getEmbed(joinedParty, ET_TYPE)
        msg = await message.channel.send(embed)
        if (this.availbleRoles(party).length == 0) {
          // logger.info(`Saved discord ID: ` + newET.discordChannel);
          joinedParty.status = "FULL"
          DB.updateET(party)
          const discordChannelMatch = String(joinedParty.discordChannel).match(/\<\#(.*?)\>/);
          if (discordChannelMatch) {
            const chanId = String(discordChannelMatch[1]);
            logger.info(`Channel ID: ${chanId}`);
            bot.channels.get(chanId).send(embed);
            await msg.delete(2000)
            message.channel.send(`Full party ${joinedParty.name} moved to ${joinedParty.discordChannel}`);
          }
        }
      }
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
	}
}