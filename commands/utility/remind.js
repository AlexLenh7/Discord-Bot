const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
// const { dayjs } = require('dayjs');
const chrono = require('chrono-node');
const { reminder } = require('../../models/reminder');
const { DateTime } = require('luxon');

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
            // check if valid time format
            const laNow = DateTime.now().setZone('America/Los_Angeles');
            const instantDate = laNow.toJSDate();

            const parsedDate = chrono.parseDate(setTime, { instant: instantDate }); // no timezone option here
            if (!parsedDate) {
                await interaction.editReply({ content: 'Invalid time format provided!', ephemeral: true });
                return;
            }

            // parsedDate is a JS Date in the server’s local timezone (probably UTC or something else)
            // So create a Luxon DateTime from it **AS IF** it is in America/Los_Angeles time zone:
            let laSetTime = DateTime.fromJSDate(parsedDate).setZone('America/Los_Angeles', { keepLocalTime: true });

            // If the parsed time is before now, assume the next day
            if (laSetTime <= laNow) {
                laSetTime = laSetTime.plus({ days: 1 });
            }

            const unixTimestamp = Math.floor(laSetTime.toSeconds());

            // if the user input can't be parsed
            if (!laSetTime)
            {
                return interaction.reply({ content: 'I could not understand that time. Try again.', flags: MessageFlags.Ephemeral });
            }
                
            // create the entry in the database
            await reminder.create({
                userId: remindUser.id,
                message: reminderMessage,
                remindAt: laSetTime,
            });

            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription(`Your reminder has been set for <t:${unixTimestamp}:F>.`);
            
            // private reply with stored information
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        catch (error)
        {
            console.error('Error with setting reminder: ', error);
            await interaction.reply({ content: 'There was a problem trying to set your reminder...', flags: MessageFlags.Ephemeral });
        }
    },
};