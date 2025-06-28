const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { gemini } = require('./gemini.js');
const { context } = require('./context.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('ask-ai-question')
        .setDescription('Ask AI to help you powered by Gemini')

            // specify the question to ask taken as a string
            .addStringOption(option =>
                option.setName('your-question')
                .setDescription('Ask Google Gemini a question')
                .setRequired(true))
            
            // optional if you want to ask a question and need context
            .addIntegerOption(option => 
                option.setName('context')
                .setDescription('Number of messages to fetch for context')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(false)),
    
    async execute(interaction)
    {
        try 
        {
            // always defer reply first thing
            await interaction.deferReply();

            const question = interaction.options.getString('your-question');
            const numMessages = interaction.options.getInteger('context');
            const targetChannel = interaction.channel; // just set the target channel to itself
            
            const messages = await context(targetChannel, numMessages);

            let prompt = `Answer the question in a straightforward short paragraph : ${question}`;
            // if messages is empty then skip context
            if (messages)
            {
                prompt += `\n\nContext:\n${messages}`;
            }
            const answer = await gemini(prompt);
            await interaction.editReply(answer);
        } 
        catch (error) 
        {
            console.error('Question command error:', error);
            await interaction.reply({ content: 'Something went wrong with your question...', flags: MessageFlags.Ephemeral });
        }
    },
};