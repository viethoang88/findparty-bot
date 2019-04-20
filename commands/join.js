const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const logger = require('winston');

const isDefined = func.isDefined;
const showHelp = func.showHelp;
const joinET = func.joinET;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'join',
	description: 'Join an ET party\n' +
		'Command: ?join ET partyID slot#\n' +
		'Example: ?join ET se42GD 2',
	execute(message, args) {
		const instance = args[0];
		logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				joinET(message, args);
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		} else {
			showHelp(message);
		}
	},
};