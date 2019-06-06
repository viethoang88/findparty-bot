const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const etfunc = require('../functions/et-functions.js');
// const logger = require('winston');

const isDefined = func.isDefined;
const showMyETs = etfunc.showMyETs;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'my',
	alias: ['myparty', 'listmy', 'listmyparty'],
	description: 'This command is for showing the parties you\'ve joined.',
	format: 'ET',
	example: 'ET',
	execute(message, args) {
		const instance = args[0];
		// logger.info('args: ' + args);

		if (isDefined(instance)) {
			switch(instance.toLowerCase()) {
				case ET_TYPE:
				showMyETs(message);
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send('Please use ' + varFile.CMD_PREFIX + 'my **ET**.');
				break;
		}
		} else if (isDefined(instance)===false) {
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'my **ET**.');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};