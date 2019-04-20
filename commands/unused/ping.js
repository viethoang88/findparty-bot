const varFile = require('../variables/var.js');

module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message) {
		message.channel.send('Pong.')
			.then(msg => {
				if (varFile.AUTO_DELETE_MODE) {
					setTimeout(function() {
						message.delete();
						msg.delete();
					}, varFile.AUTO_DELETE_TIME);
				}
			});
	},
};