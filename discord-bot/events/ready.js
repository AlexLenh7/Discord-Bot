const { Events } = require('discord.js');
const { sequelize } = require('../commands/utility/database');
// const { reminder } = require('../../models/reminder');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		try {
			// sync sequelize
			await sequelize.sync();
			console.log('Database synced');
		} catch (error) {
			console.log('There was a error with syncing the database', error);
		}
	},
};
