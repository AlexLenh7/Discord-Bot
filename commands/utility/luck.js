const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('feeling-lucky')
        .setDescription('Lets see if your lucky today or not'),
        
    async execute(interaction)
    {
        // cs case probabilities
        const cs2Prob = [
            { name: 'Buy a lottery ticket',  chance: 0.26 },
            { name: 'Super lucky',    chance: 0.8 },
            { name: 'Pretty lucky',   chance: 6.94 },
            { name: 'Average', chance: 62.0 },
            { name: 'Could be better', chance: 20 },
            { name: 'Try again tomorrow lol',   chance: 10.0 },
        ];

        // function to calculate probablility
        function probability()
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
            const luck = probability();
            await interaction.reply(`${luck}`);
            
        } 
        catch (error) 
        {
            console.error('Issue with testing your luck: ', error);
            await interaction.reply({ content: 'There was a problem with testing your luck!', flags: MessageFlags.Ephemeral });
        }
    },
};
