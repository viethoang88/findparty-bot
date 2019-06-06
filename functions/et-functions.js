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
};