const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
// const logger = require('winston');

const isDefined = func.isDefined;
const deleteETParty = func.deleteETParty;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'delete',
	description: 'This command is for deleting ET party/parties.',
	format: 'ET PartyID1 PartyID2',
	example: 'ET se42GD 1fnj12',
	notes: 'Only creator of party or person with permissions can delete party.',
	group: 'party-finder',
	execute(message, args) {
		const instance = args[0];
		// logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				deleteETParty(message, args);
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send('Please use ' + varFile.CMD_PREFIX + 'delete **ET** PartyID.');
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};