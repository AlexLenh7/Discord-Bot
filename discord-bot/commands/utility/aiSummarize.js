const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { gemini } = require('./gemini.js');
const { context } = require('./context');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('ask-ai-summarize')
        .setDescription('Ask AI to help you powered by Gemini')

            // specify the amount of messages you want to summarize
            .addIntegerOption(option => 
                option.setName('messages')
                .setDescription('Select a number of messages to summarize in a channel')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
            
            // specify which channel you want to summarize from
            .addChannelOption(option =>
                option.setName('channel')
                .setDescription('Specify the channel you want to summarize from')
                .setRequired(false)),
    
    async execute(interaction)
    {
        try 
        {
            // always defer reply first thing
            await interaction.deferReply();

            // get the target channel for summary
            const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
            
            const numMessages = interaction.options.getInteger('messages');

            const messages = await context(targetChannel, numMessages);

            const summary = await gemini(`Summarize the following messages in a short paragraph: ${messages}`);
            await interaction.editReply(summary);
        }
        catch (error) 
        {
            console.error('Summarize command error: ', error);
            await interaction.reply({ content: 'Something went wrong with summarize...', flags: MessageFlags.Ephemeral });
        }
    },
};
