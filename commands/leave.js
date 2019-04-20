const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const logger = require('winston');

const isDefined = func.isDefined;
const showHelp = func.showHelp;
const leaveETParty = func.leaveETParty;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'leave',
	description: 'Leave ET party\n' +
		'Command: ?leave ET ID (reason)\n' +
		'Example: ?leave ET se42GD (I am not feeling well)',
	execute(message, args) {
		const instance = args[0];
		logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				leaveETParty(message, args);
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		} else {
			showHelp(message);
		}
	},
};