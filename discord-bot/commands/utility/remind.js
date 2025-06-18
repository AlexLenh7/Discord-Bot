const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
// const { dayjs } = require('dayjs');
const chrono = require('chrono-node');
const { reminder } = require('../../models/reminder');

module.exports = 
{
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Bot will send a dm at the specified time')

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
                .setRequired(true))
                
            // remind user with message, 
            .addUserOption(option =>
                option.setName('user')
                .setDescription('person to remind')
                .setRequired(false)),

    async execute(interaction)
    {
        try 
        {
            // get the string for the reminder
            const reminderMessage = interaction.options.getString('message');

            // get the time for the reminder
            const setTime = interaction.options.getString('time');

            // get the user
            let remindUser = interaction.options.getUser('user');

            // if user is empty set user to message sender
            if (!remindUser)
            {
                remindUser = interaction.user;
            }

            // parse the user input into a readable date object
            const reminderTime = chrono.parseDate(setTime);

            // if the user input can't be parsed
            if (!reminderTime)
            {
                return interaction.reply({ content: 'I could not understand that time. Try again.', flags: MessageFlags.Ephemeral });
            }
                
            // create the entry in the database
            await reminder.create({
                userId: remindUser.id,
                message: reminderMessage,
                remindAt: reminderTime,
            });

            const unixTimestamp = Math.floor(reminderTime.getTime() / 1000);

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription(`Your reminder has been set for <t:${unixTimestamp}:F>.`);
            
            // private reply with stored information
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        catch (error)
        {
            console.error('Issue with setting reminder ', error);
            await interaction.reply({ content: 'There was a problem trying to set your reminder', flags: MessageFlags.Ephemeral });
        }
    },
};