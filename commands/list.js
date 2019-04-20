const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const logger = require('winston');

module.exports = {
	name: 'list',
	description: 'List out all ET parties or specific party (coming soon)\nCommand: ?list ET or ?list ET ID\nExample: ?list ET se42GD',
	execute(message, args) {
		const instance = args[0];
		if (args.length > 0 && func.isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case varFile.ET_TYPE:
				var results = varFile.DB.findAllET();
				logger.debug(`Found ETs: ${results}`);
				func.displayLFPETResults(message, results);
				break;
			}
		} else if (func.isDefined(instance) === false) {
			// message.channel.send('Please specify which list you are requesting, ET, Oracle, MVP or Any. E.g. ' + CMD_PREFIX + 'LIST ET se42GD')
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'list ET.');
		} else {
			func.showHelp(message);
		}
	},
};