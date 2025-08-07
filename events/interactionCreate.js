const { Events, MessageFlags } = require('discord.js');
const { level } = require('../models/level');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// check that it is a chat input command
		if (!interaction.isChatInputCommand()) return;

		// grab the user who used the command
		const user = interaction.user;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
			console.log(`${user} used a command`);

			// check if user exists in database
			const exists = await level.findOne({
				where: {
					userId: user.id,
				},
			});
			
			// level ranks
			const riceRanks = [
				{ min: 0, name: "Unranked" },
				{ min: 300, name: "Bronze Beggar" },
				{ min: 600, name: "Silver Slaver" },
				{ min: 1200, name: "Golden Grinder" },
				{ min: 2400, name: "Platinum Pussy" },
				{ min: 4800, name: "Diamond Daddy" },
				{ min: 9600, name: "Emerald Edger" },
				{ min: 19200, name: "Grandmaster Gaymer" },
			];

			// returns the xp equivalant rank
			// NOTE: this returns an object
			function getRiceRank(xp) {
				return riceRanks.slice().reverse().find(r => xp >= r.min);
			}

			// for each command check if user's rank exists
			if (exists)
			{
				// current rank stored in database before adding xp 
				const currentRank = exists.rank;

				// increments xp by 10 and reloads the entry
				await exists.increment('xp', { by: 10 });
				await exists.reload();

				// get the new rank if there is one based off xp
				const newRank = getRiceRank(exists.xp);

				// get the current index of said rank
				const currentIndex = riceRanks.indexOf(newRank);
				const nextRank = riceRanks[currentIndex + 1];

				const nextRankName = nextRank?.name ?? 'MAX';
				const nextXp = nextRank ? nextRank.min - exists.xp : 0;

				// checks if user gains a new rank
				if (currentRank !== newRank.name)
				{
					console.log(`${user.tag} leveled up! 🎉 New Rank: ${newRank.name}, current rank: ${currentRank}, next rank: ${nextRankName}, xp needed: ${nextXp}`);
					
					await exists.update({ rank: newRank.name });

					await interaction.followUp(`🎉 Congrats <@${user.id}>, you leveled up to ${newRank.name}!`);
				}
				else // update the rank to match xp
				{
					await exists.update({ 
						rank: newRank.name,
						nextRank: nextRankName,
						nextXp: nextXp, 
					});
					console.log(`entry exists for ${user} New XP: ${exists.xp}, current rank: ${newRank.name}, next rank: ${nextRankName}, xp needed: ${nextXp}`);
				}
			}
			else // otherwise we create the entry
			{
				await level.create({
					userId: user.id,
				});
			}

		} catch (error) {
			console.error('There was an error with interactionCreate' + error);
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	},
};
