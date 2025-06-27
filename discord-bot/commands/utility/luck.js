const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('cs-case-sim')
        .setDescription('Simulate opening cases in CS')
        
        .addIntegerOption(option =>
                    option.setName('amount-of-cases')
                    .setDescription('Number of cases to open')
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)),
        
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
        } 
        catch (error) 
        {
            console.error('Issue with CS case simulator: ', error);
            await interaction.reply({ content: 'There was a problem with opening your cases!', flags: MessageFlags.Ephemeral });
        }
    },
};