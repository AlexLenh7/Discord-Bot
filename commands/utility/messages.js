const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = 
{
    cooldown: 10,
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
        /*
        Get the message amount specified by the user to delete.
        Fetch the messages in the current channel and loop through
        each message to delete.
        */
        try
        {
            const messageAmt = interaction.options.getInteger('amount-of-messages');
            const history = await interaction.channel.messages.fetch({ limit: messageAmt });
            history.forEach(message => {
                message.delete();
            });
            await interaction.reply({ content: `Deleted ${messageAmt} messages.`, flags: MessageFlags.Ephemeral });
        }
        catch (error) 
        {
            console.error('Error with message deleting: ', error);
            await interaction.reply({ content: 'There was a problem deleting messages...', flags: MessageFlags.Ephemeral });
        }
    },
};
