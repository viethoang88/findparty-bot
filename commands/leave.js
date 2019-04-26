const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
// const logger = require('winston');

const isDefined = func.isDefined;
const leaveETParty = func.leaveETParty;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'leave',
	description: 'This command is for leaving an ET party that you\'ve joined.',
	format: 'ET PartyID (reason)',
	example: 'ET se42GD (I am not feeling well)',
	notes: 'Make sure reason is in ( ) brackets.',
	group: 'party-finder',
	execute(message, args) {
		const instance = args[0];
		// logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				leaveETParty(message, args);
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send('Please use ' + varFile.CMD_PREFIX + 'leave **ET** PartyID (reason).');
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'leave **ET** PartyID (reason).');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};