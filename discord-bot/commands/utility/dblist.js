const { SlashCommandBuilder } = require('discord.js');
const { website } = require('../../models/websites.js');
const { reminder } = require('../../models/reminder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('lists all entries associated with the user'),
    
    async execute(interaction)
    {
        try {
            const user = interaction.user;

            const allWebsites = await website.findAll({
                where: {
                    userId: user.id,
                },
            });

            const allReminders = await reminder.findAll({
                where: {
                    userId: user.id,
                },
            });

            let message = '';

            // checks and lists all websites tracking
            if (allWebsites.length != 0)
            {
                message += 'You are currently tracking:\n';
                for (const entries of allWebsites)
                {
                    message += `Website: ${entries.website}\nKeyword: ${entries.keyword}\nTitle: ${entries.title}\n`;
                }
            }
            else
            {
                message += ('You have no websites currently being tracked!\n');
            }

            // checks and lists all reminders
            if (allReminders.length != 0)
            {
                message += 'Your current reminders:\n';
                for (const entries of allReminders)
                {
                    const unixTimestamp = Math.floor(entries.remindAt.getTime() / 1000);
                    message += `Message: ${entries.message}\nTime: ${unixTimestamp}\n`;
                }
            }
            else
            {
                message += 'You have no reminders currently set!';
            }

            await interaction.reply(message);
            
        } catch (error) {
            console.log('There was an error trying to list entries! ', error);
        }
    },
};