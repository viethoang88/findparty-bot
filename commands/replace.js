const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
const etfunc = require('../functions/et-functions.js');
// const logger = require('winston');

const isDefined = func.isDefined;
const replaceETrole = func.replaceETrole;
const ET_TYPE = varFile.ET_TYPE;
const prefix = varFile.CMD_PREFIX;

module.exports = {
	name: 'replace',
	description: 'This command is for replacing registered person with another person. Please specify if you\'re using an alt/slave.',
	format: 'ET partyID slot# @person2 alt',
	example: 'ET se42GD 2 @Shelli alt',
	group: 'party-finder',
	// usage: '<ET> <PartyID:string> <SlotNo:int{1,5}> ]',
	execute(message, args) {
		const instance = args[0];
		// logger.info('args: ' + args);

		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
				replaceETrole(message, args);
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send('Please use ' + varFile.CMD_PREFIX + 'replace **ET** PartyID Slot# @person.');
				break;
			}
		} else if (isDefined(instance) === false) {
			message.channel.send('Please use ' + varFile.CMD_PREFIX + 'replace **ET** PartyID Slot# @person.');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};