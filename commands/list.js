const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const etfunc = require('../functions/et-functions.js');
// const logger = require('winston');

module.exports = {
	name: 'list',
	description: 'This command is for listing out all ET parties',
	format: 'ET',
	example: 'ET ',
	group: 'party-finder',
	execute(message, args) {
		const instance = args[0];
		let options = '';
		if (func.isDefined(args[1])) {
			options = args[1].split(/\$+/);
		}
		if (args.length > 0 && func.isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case varFile.ET_TYPE:
				if(args[1] == 'all' || options[0] == 'all') {
					var results = varFile.DB.findAllET();
				} else {
					var results = varFile.DB.findOpenET();
				}
				// logger.debug(`Found ETs: ${results}`);
				etfunc.displayETResults(message, args, results);
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send('Please use ' + varFile.CMD_PREFIX + 'list **ET**.');
				break;
			}
		} else if (func.isDefined(instance) === false) {
			// message.channel.send('Please specify which list you are requesting, ET, Oracle, MVP or Any. E.g. ' + CMD_PREFIX + 'LIST ET se42GD')
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'list **ET**.');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};