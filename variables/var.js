const Discord = require('discord.js');
const DBModule = require('../db.js');

module.exports = {
	bot: new Discord.Client(),
	DB: new DBModule(),
	CMD_PREFIX: '-',
	prefix: this.CMD_PREFIX,
	ET_TYPE: 'et',
	ORACLE_TYPE: 'oracle',
	MVP_TYPE: 'mvp',
	BQ: 'bq',
	VAL_40_TYPE: 'val40',
	VAL_60_TYPE: 'val60',
	VAL_80_TYPE: 'val80',
	VAL_100_TYPE: 'val100',
	AUTO_DELETE_MODE: false,
	AUTO_DELETE_COMMANDS: true,
	AUTO_DELETE_TIME: 15000,
	TANK_ROLE_ID: '571085638397591629',
	HEALS_ROLE_ID: '571085671708491783',
	WIZ_ROLE_ID: '571085818828161046',
	RANGE_DPS_ROLE_ID: '571085780055883781',
	MEELEE_DPS_ROLE_ID: '571085745343823876'
};