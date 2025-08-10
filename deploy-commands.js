const { REST, Routes } = require('discord.js');
const { clientId, token, guildIds } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
} 

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log('Wiping ALL global and guild commands...');

        // Wipe global commands
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('Global commands cleared.');

        // Wipe and reload each guild's commands
        for (const guildId of guildIds) {
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
            console.log(`Cleared commands for guild: ${guildId}`);

            // deploy updated commands
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log(`Reloaded ${commands.length} commands for guild: ${guildId}`);
        }

        console.log('All commands wiped and redeployed.');
	} catch (error) {
		console.error(error);
	}
})();
