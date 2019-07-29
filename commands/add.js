const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const etfunc = require('../functions/et-functions.js');
// const logger = require('winston');

const isDefined = func.isDefined;
const addETUser = func.addETUser;
const ET_TYPE = varFile.ET_TYPE;
const prefix = varFile.CMD_PREFIX;

module.exports = {
	name: 'add',
	description: 'This command is for adding others to an existing ET party. Please specify if you\'re using an alt/slave.',
	format: 'ET partyID slot# @person alt',
	example: 'ET se42GD 2 @SilvStar alt',
	group: 'party-finder',
	// usage: '<ET> <PartyID:string> <SlotNo:int{1,5}> ]',
	execute(message, args) {
		const instance = args[0];
		// logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				addETUser(message, args);
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send('Please use ' + varFile.CMD_PREFIX + 'add **ET** PartyID Slot# @person.');
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'add **ET** PartyID Slot# @person.');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};