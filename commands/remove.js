const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const etfunc = require('../functions/et-functions.js');
// const logger = require('winston');

const isDefined = func.isDefined;
const removeETUser = func.removeETUser;
const ET_TYPE = varFile.ET_TYPE;
const prefix = varFile.CMD_PREFIX;

module.exports = {
	name: 'remove',
	description: 'This command is for removing user from existing ET party.',
	format: 'ET partyID slot#',
	example: 'ET se42GD 2',
	group: 'party-finder',
	// usage: '<ET> <PartyID:string> <SlotNo:int{1,5}> ]',
	execute(message, args) {
		const instance = args[0];
		// logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				removeETUser(message, args);
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send('Please use ' + varFile.CMD_PREFIX + 'remove **ET** PartyID Slot#.');
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'remove **ET** PartyID Slot#.');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};