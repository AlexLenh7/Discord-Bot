const { SlashCommandBuilder } = require('discord.js');
const { reminder } = require('../../models/reminder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('lists all entries associated with the user'),
    
    async execute(interaction)
    {
        try {
            const user = interaction.user;

            const allReminders = await reminder.findAll({
                where: {
                    userId: user.id,
                },
            });

            let message = '';

            // checks and lists all reminders
            if (allReminders.length != 0)
            {
                message += 'Your current reminders:\n';
                for (const entries of allReminders)
                {
                    const unixTimestamp = Math.floor(entries.remindAt.getTime() / 1000);
                    message += `Message: ${entries.message}\nTime: <t:${unixTimestamp}:F>\n`;
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