const varFile = require('../variables/var.js');
const partyFunc = require('../functions/party-functions.js');
const func = require('../functions/functions.js');
const Discord = require('discord.js');
// const logger = require('winston');

module.exports = {
	name: 'apply',
	description: 'This command is for applying to available parties',
	format: 'ET',
	example: 'ET ',
	group: 'party-finder',
	async execute(message, args) {
    var chosenParty;
    var chosenRole;
    const parties = partyFunc.getParties(message);
    partyFunc.showParties(message, parties);   
    var response = await message.channel.awaitMessages(m => m.author.id === message.author.id, {maxMatches: 1, time: 10000})
    if (isNaN(response.first().content) || response.first().content > parties.length || response.first().content <= 0) {
      message.channel.send("Invalid response, there is no such party! Applying for party cancelled!");
    } else {
      chosenParty = partyFunc.getParty(parties[response.first().content - 1].name)
       
      var availRoles = partyFunc.availableRoles(chosenParty)
      var choices = "";
      for(i=0;i<availRoles.length;i++) {
        choices += `${i + 1} - ${availRoles[i]} \n`
      }        
      message.channel.send('**Choose an available role**');
      message.channel.send(choices);
      var response = await message.channel.awaitMessages(m => m.author.id === message.author.id, {maxMatches: 1, time: 10000})
      chosenRole = availRoles[response.first().content - 1];
      if(!chosenParty || !chosenRole) { // check input on first try
        message.channel.send(`Please enter a valid role.`);
        response = await message.channel.awaitMessages(m => m.author.id === message.author.id, {maxMatches: 1, time: 10000});
        chosenRole = availRoles[response.first().content - 1];
      }
      partyFunc.joinParty(message, chosenParty, chosenRole);
    }
	}
};