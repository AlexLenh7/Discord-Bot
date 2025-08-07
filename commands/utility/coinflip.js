const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin, heads or tails'),

    async execute(interaction)
    {
        function fiftyFifty()
        {
            const random = Math.random() < 0.5;
            if (random)
            {
                return 'Heads';
            }
            return 'Tails';
        }
        
        try 
        {
            await interaction.reply(fiftyFifty());
        } 
        catch (error) 
        {
            console.error('Issue with rng command: ', error);
            await interaction.reply({ content: 'There was a problem with rng', flags: MessageFlags.Ephemeral });
        }
    },
};
