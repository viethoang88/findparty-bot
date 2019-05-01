const varFile = require('../variables/var.js');
const func = require('../functions/functions.js');
// const logger = require('winston');

const isDefined = func.isDefined;
const createETParty = func.createETParty;
const ET_TYPE = varFile.ET_TYPE;

module.exports = {
	name: 'create',
	description: 'This command is for creating a new ET party',
	format: 'ET :OptionalPartyName: [date and time] (ROM Channel) #discord-channel $CUSTOM ROLES$',
	example: 'ET :AwesomeParty: [19 May 16:30] (EN14) #et-1 $TANK PRIEST MVP RANGED WIZ$',
	notes: 'After creation there will be 5 character ID for each party. Use it for other commands.\n' +
		'- *_[Date]_* must be in *_[ ]_* brackets and format *_DD MMM_*. E.g. *_19 Dec_*\n' +
		'- *_(Channel)_* must be in *_( )_* brackets. \n' +
		'- *_#Discord-Channel_* Starts with #. Make sure the room exist. \n' +
		'- *_$Roles$_* in between * * are optional. If you don\'t specify, roles will be set to default TANK PRIEST DPS DPS DPS \n' +
		'- *_:PartyID:_* in between : : is optional. If you don\'t specify, a 5 character ID will be generated and you can use it in other commands. \n',
	group: 'party-finder',
	execute(message, args) {
		const instance = args[0];
		// logger.info('args: ' + args);
		if (args.length > 0 && isDefined(instance)) {
			switch(instance.toLowerCase()) {
			case ET_TYPE:
			// ^create ET [date+time] (ROMChannel) #ET-1 {roles}
			// roles: are optional (default: TANK PRIEST DPS DPS DPS)
				// logger.debug('Creating ET party...');
				createETParty(message, args);	
				break;
			default:
				// message.channel.send(instance + ' does not exists. Please use ET, Oracle, MVP, BQRIFT, ANY')
				message.channel.send(instance + ' does not exists. Please use ET.');
				break;
			}
		} else if (isDefined(instance) === false) {
			// message.channel.send('Please specify what party you are creating, ET, Oracle, MVP or Any.')
			message.channel.send('Please specify ET in your commands.');
		} else {
			message.channel.send('Opps, there is a problem processing your request. Please check your format.');
		}
	},
};