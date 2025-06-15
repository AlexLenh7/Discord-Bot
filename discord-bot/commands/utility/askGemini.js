const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { gemini } = require('./gemini.js');
const { context } = require('./context');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('askgemini')
        .setDescription('Ask Google Gemini to help you')

        // ask gemini to summarize messages within a channel
        .addSubcommand(subCommand =>
            subCommand
                .setName('summarize')
                .setDescription('Select a number of messages to summarize in a channel')
                
                // specify the amount of messages you want to summarize
                .addIntegerOption(option => 
                    option.setName('amount-of-messages')
                    .setDescription('Number of messages for context')
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true))
                
                // specify which channel you want to summarize from
                .addChannelOption(option =>
                    option.setName('channel')
                    .setDescription('The channel you want to summarize from')
                    .setRequired(false)))

        // ask gemini a question takes in a string 
        .addSubcommand(subCommand =>
            subCommand
                .setName('question')
                .setDescription('Ask Google Gemini a question')

                // specify the question to ask taken as a string
                .addStringOption(option =>
                    option.setName('question-to-ask')
                    .setDescription('Ask Google Gemini a question')
                    .setRequired(true))
                
                // optional if you want to ask a question and need context
                .addIntegerOption(option => 
                    option.setName('amount-of-messages')
                    .setDescription('Number of messages for context')
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(false))),
    
    async execute(interaction)
    {
        try {

            // always defer reply first thing
            await interaction.deferReply();

            // try to ask a question
            // optional get context from history of messages
            if (interaction.options.getSubcommand() === 'question')
            {
                const question = interaction.options.getString('question-to-ask');
                const numMessages = interaction.options.getInteger('amount-of-messages');
                const targetChannel = interaction.channel; // just set the target channel to itself
                                
                const messages = await context(targetChannel, numMessages);

                let prompt = `Answer in a short paragraph: ${question}`;
                if (messages)
                {
                    prompt += `\n\nContext:\n${messages}`;
                }
                const answer = await gemini(prompt);
                await interaction.editReply(answer);
            }

            // try summarize
            else if (interaction.options.getSubcommand() === 'summarize')
            {
                // get the target channel for summary
                const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
                
                const numMessages = interaction.options.getInteger('amount-of-messages');

                const messages = await context(targetChannel, numMessages);

                const summary = await gemini(`Summarize the following messages in a short paragraph: ${messages}`);
                await interaction.editReply(summary);
            }
            
        } catch (error) {
            console.error('Gemini Error:', error);
            await interaction.reply({ content: 'Something went wrong with Gemini', flags: MessageFlags.Ephemeral });
        }
    },
};