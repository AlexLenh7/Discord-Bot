const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 2, // set cooldown for 2 seconds before sending another command
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
