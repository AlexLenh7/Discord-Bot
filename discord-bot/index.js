// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { token } = require('./config.json');
const { Op } = require('sequelize');
const { reminder } = require('./models/reminder');

// Create a new client instance
// specifiy permissions 
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

// load all commands into bot
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
	    } else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Start listening to events in events folder
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

setInterval(async () => { 
	try {
		const reminders = await reminder.findAll({
			where: {
				remindAt: {
					[Op.lte]: new Date(), // Only fetch reminders that are due
				},
			},
		});

		if (!reminders.length) return;

		for (const remind of reminders) {
			try {
				const user = await client.users.fetch(remind.userId);

				await user.send({
					content: `${user}, you asked me to remind you about: ${remind.message}`,
				});

				await remind.destroy();
			} catch (error) {
				console.error(`Failed to send reminder to ${remind.userId}:`, error);
			}
		}
	} catch (error) {
		console.error('Error checking reminders:', error);
	}
}, 5 * 1000);

// Log in to Discord with your client's token
client.login(token);
