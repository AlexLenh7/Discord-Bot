const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('test-your-luck')
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
                .setDescription('50/50 heads or tails?'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rng')
                .setDescription('Generate a random number')
                .addIntegerOption(option => 
                    option.setName('first-number')
                    .setDescription('First number you want')
                    .setMinValue(1)
                    .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('second-number')
                    .setDescription('Second number you want')
                    .setMinValue(2)
                    .setRequired(true))),

    async execute(interaction)
    {
        // const caseGif = new EmbedBuilder()
        //     .setImage('https://i.makeagif.com/media/7-02-2019/ewHSwm.gif')
        //     .setColor(0x00AE86);
            
        // await channel.send({ embeds: [caseGif] });
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

        // function for a rand num generator
        // generate a random number between 0 and user input
        function rng(firstNum, secondNum)
        {
            const rngNum = Math.random() * (secondNum - firstNum) + firstNum;
            return rngNum;
        }

        // cs2 gambling lol
        try 
        {
            if (interaction.options.getSubcommand() === 'gamble')
            {     
                // await interaction.channel.send({ embeds: [caseGif] }); 
                const caseAmt = interaction.options.getInteger('amount-of-cases');
                const results = [];
                for (let i = 0; i < caseAmt; i++)
                {
                    results.push(caseProbability());
                }
                await interaction.deferReply();
                await interaction.editReply(`You opened ${caseAmt} case(s) and got:\n **${results.join('** **')}**`);
            }
            // simple coin flip
            else if (interaction.options.getSubcommand() === 'coinflip')
            {
                await interaction.reply(fiftyFifty());
            }
            // random num generator
            else if (interaction.options.getSubcommand() === 'rng')
            {
                const firstNum = interaction.options.getInteger('first-number');
                const secondNum = interaction.options.getInteger('second-number');
                const result = Math.round(rng(firstNum, secondNum));
                await interaction.reply(`Your number is: ${result}`);
            }
        } 
        catch (error) 
        {
            console.error('Issue with luck: ', error);
            await interaction.reply({ content: 'There was a problem with luck', flags: MessageFlags.Ephemeral });
        }
    },
};