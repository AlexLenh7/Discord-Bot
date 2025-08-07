const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('rng')
        .setDescription('Generate a random number between x and y inclusive')

        .addIntegerOption(option => 
            option.setName('first-number')
            .setDescription('First number you want')
            .setMinValue(1)
            .setRequired(true))
            
        .addIntegerOption(option =>
            option.setName('second-number')
            .setDescription('Second number you want')
            .setMinValue(2)
            .setRequired(true)),

    async execute(interaction)
    {
        // function for a rand num generator
        // generate a random number between 0 and user input
        function rng(firstNum, secondNum)
        {
            const rngNum = Math.random() * (secondNum - firstNum) + firstNum;
            return rngNum;
        }
        try 
        {
            const firstNum = interaction.options.getInteger('first-number');
            const secondNum = interaction.options.getInteger('second-number');
            const result = Math.round(rng(firstNum, secondNum));
            await interaction.reply(`Your number is: ${result}`);   
        } 
        catch (error) 
        {
            console.error('Error with rng command: ', error);
            await interaction.reply({ content: 'There was a problem with rng...', flags: MessageFlags.Ephemeral });
        }
    },
};
