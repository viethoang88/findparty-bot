const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const logger = require('winston');

const isDefined = func.isDefined;
const showHelp = func.showHelp;
const deleteETParty = func.deleteETParty;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'delete',
	description: 'Delete ET party\n' +
		'Command: ?delete ET ID\n' +
		'Example: ?delete ET se42GD 1fnj12\n' +
		'Notes: Only creator of party or person with permissions can delete party.',
	execute(message, args) {
		const instance = args[0];
		logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				deleteETParty(message, args);
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		} else {
			showHelp(message);
		}
	},
};