const { SlashCommandBuilder, MessageFlags } = require('discord.js');
// const { dayjs } = require('dayjs');
const chrono = require('chrono-node');
const { reminder } = require('../../models/reminder');

module.exports = 
{
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Bot will send a dm at the specified time')

        // remind user with message, 
        .setName('remind')
        .setDescription('Bot will send a dm at the specified time')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('person to remind')
            .setRequired(true))

        .addStringOption(option =>
            option
            .setName('message')
            .setDescription('Message to remind')
            .setRequired(true))
        
        // user dayjs to parse string time 
        .addStringOption(option => 
            option
            .setName('time')
            .setDescription('Date and time to send the reminder')
            .setRequired(true)),
    
    async execute(interaction)
    {
        try 
        {
            // get the string for the reminder
            const reminderMessage = interaction.options.getString('message');

            // get the time for the reminder
            const setTime = interaction.options.getString('time');

            // get the user
            const remindUser = interaction.options.getUser('user');
            
            // parse the user input into a readable date object
            const reminderTime = chrono.parseDate(setTime);

            // if the user input can't be parsed
            if (!reminderTime)
            {
                return interaction.reply({ content: 'I could not understand that time. Try again.', flags: MessageFlags.Ephemeral });
            }
                
            // create the entry in the database
            const newReminder = await reminder.create({
                userId: remindUser.id,
                message: reminderMessage,
                remindAt: reminderTime,
            });
                
            // get the time between current and reminder
            const delay = reminderTime - Date.now();

            if (delay <= 0) 
            {
                return interaction.reply({ content: 'Reminder has already passed.', flags: MessageFlags.Ephemeral });
            }

            // set a timeout with the delay between now and reminder time
            setTimeout(async () => {
                try {
                    // fetch the reminder from the database storing the userid
                    const user = await interaction.client.users.fetch(newReminder.userId);

                    await user.send(`Reminder from ${interaction.user}: ${newReminder.message}`);
                    
                    // destroy the reminder after sending it
                    await newReminder.destroy();
                
                } catch (error) {  
                    console.log('Failed to send reminder: ', error); 
                }
            }, delay);

            // private reply with stored information
            await interaction.reply({ content: `Reminder set for ${reminderTime}`, flags: MessageFlags.Ephemeral });
        }
        catch (error)
        {
            console.error('Issue with setting reminder ', error);
            await interaction.reply({ content: 'There was a problem trying to set your reminder', flags: MessageFlags.Ephemeral });
        }
    },
};