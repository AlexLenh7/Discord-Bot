const { SlashCommandBuilder } = require('discord.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('lucky')
        .setDescription('Test your luck!')
        // subcommand for testing luck in cs2
        .addSubcommand(subcommand => 
            subcommand
                .setName('gamble')
                .setDescription('Open a case in cs2')
                .addIntegerOption(option =>
                    option.setName('amount-of-cases')
                    .setDescription('Number of cases to open')
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('coinflip')
                .setDescription('50/50 chances')),

    async execute(interaction)
    {
        // cs case probabilities
        const cs2Prob = [
            { name: '💛',  chance: 0.26 },
            { name: '❤️',    chance: 0.64 },
            { name: '🩷',   chance: 3.2 },
            { name: '💜', chance: 15.98 },
            { name: '💙',   chance: 79.92 },
        ];

        // function to calculate probablility
        function caseProbability()
        {
            const randomNumber = Math.random() * 100;
            let chance = 0;
            for (const outcome of cs2Prob)
            {
                chance += outcome.chance;
                if (chance > randomNumber)
                {
                    return outcome.name;
                }
            }
        }
        
        // function for coin flip
        function fiftyFifty()
        {
            const random = Math.random() < 0.5;
            if (random)
            {
                return 'Heads';
            }
            return 'Tails';
        }

        // cs2 gambling lol
        if (interaction.options.getSubcommand() === 'gamble')
        {
            const caseAmt = interaction.options.getInteger('amount-of-cases');
            const results = [];
            for (let i = 0; i < caseAmt; i++)
            {
                results.push(caseProbability());
            }
            await interaction.reply(`You opened ${caseAmt} case(s) and got:\n **${results.join('** **')}**`);
        }
        // simple coin flip
        else if (interaction.options.getSubcommand() === 'coinflip')
        {
            await interaction.reply(fiftyFifty());
        }
    },
};