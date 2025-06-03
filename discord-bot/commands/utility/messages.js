const { SlashCommandBuilder } = require('discord.js');

module.exports = 
{
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('Modify messages')
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete messages')
                .addIntegerOption(option =>
                    option.setName('amount-of-messages')
                    .setDescription('Number of messages to delete')
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true))),

    async execute(interaction)
    {
        try
        {
            const messageAmt = interaction.options.getInteger('amount-of-messages');
            const history = await interaction.channel.messages.fetch({ limit: messageAmt });
            history.forEach(message => {
                message.delete();
            });
            await interaction.reply(`Deleted ${messageAmt} messages.`);
        }
        catch (error) 
        {
            console.error('Issue with deleting ', error);
            await interaction.reply('There was a problem...');
        }
    },
};
