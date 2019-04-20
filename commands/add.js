const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const logger = require('winston');

const isDefined = func.isDefined;
const showHelp = func.showHelp;
const addETUser = func.addETUser;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'add',
	description: 'Add others to ET party\n' +
		'Command: ?add ET partyID slot# @person\n' +
		'Example: ?add ET se42GD 2 @SilvStar',
	execute(message, args) {
		const instance = args[0];
		logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				addETUser(message, args);
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		} else {
			showHelp(message);
		}
	},
};