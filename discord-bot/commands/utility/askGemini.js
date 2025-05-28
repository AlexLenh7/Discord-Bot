const { SlashCommandBuilder } = require('discord.js');
const { gemini } = require('./gemini.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('askgemini')
        .setDescription('Ask Google Gemini to help you')
        .addSubcommand(subCommand =>
            subCommand
                .setName('summarize')
                .setDescription('Select a number of messages to summarize in a channel')
                .addIntegerOption(option => 
                    option.setName('amount-of-messages')
                    .setDescription('Number of messages to look through')
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)))
        .addSubcommand(subCommand =>
            subCommand
                .setName('question')
                .setDescription('Ask Google Gemini a question')
                .addStringOption(option =>
                    option.setName('question-to-ask')
                    .setDescription('Ask Google Gemini a question')
                    .setRequired(true))),
    
    async execute(interaction)
    {
        try {
            // try to ask a question
            if (interaction.options.getSubcommand() === 'question')
            {
                const question = interaction.options.getString('question-to-ask');
                await interaction.deferReply();
                const answer = await gemini(`Answer in a short paragraph: ${question}`);
                await interaction.editReply(answer);
            }
            // try summarize
            else if (interaction.options.getSubcommand() === 'summarize')
            {
                const numMessages = interaction.options.getInteger('amount-of-messages');

                const fetchMessages = await interaction.channel.messages.fetch({ numMessages });
                
                // deffer this since it might take some time
                await interaction.deferReply();

                // format messages as username: message
                const messages = [...fetchMessages.values()]
                    .reverse()
                    .map(msg => `${msg.author.username}: ${msg.content}`)
                    .join('\n');

                const summary = await gemini(`Summarize the following messages in a short paragraph: ${messages}`);
                await interaction.editReply(summary);
            }
            
        } catch (error) {
            console.error('Gemini Error:', error);
            await interaction.reply('There was a problem with Gemini');
        }
    },
};