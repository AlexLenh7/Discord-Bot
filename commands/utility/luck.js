const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = 
{
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('feeling-lucky')
        .setDescription('Lets see if your lucky today or not')

        .addIntegerOption(option =>
            option
            .setName('tries')
            .setDescription('How many times do you want to run this command? (Displays all possible values)')
            .setMinValue(2)
            .setMaxValue(100)
            .setRequired(false)),
        
    async execute(interaction)
    {
        await interaction.deferReply();

        const tryAmt = interaction.options.getInteger('tries') ?? 1;

        // probabilities
        const prob = [
            { name: 'Open a CS case right now', chance: 0.26 },
            { name: '5 Star luck', chance: 0.8 },
            { name: 'Pretty lucky', chance: 6.94 },
            { name: 'Average', chance: 77.0 },
            { name: 'Could be better', chance: 10.0 },
            { name: 'Yikes', chance: 5.0 },
        ];

        // function to calculate probablility
        async function probability()
        {
            const randomNumber = Math.random() * 100;
            let chance = 0;
            for (const outcome of prob)
            {
                chance += outcome.chance;
                if (chance > randomNumber)
                {
                    return outcome.name;
                }
            }
        }
        
        try 
        {
            // Initialize resultMap from probabilities, all values set to 0
            const resultMap = new Map(prob.map(({ name }) => [name, 0]));

            // if option is not null
            if (tryAmt === 1)
            {
                const luck = await probability();
                await interaction.editReply(`Your luck today is: ${luck}`);
            } 
            else 
            {   
                // go through the rolls
                for (let i = 0; i < tryAmt; i++)
                {
                    const result = await probability();
                    resultMap.set(result, resultMap.get(result) + 1);
                }

                // Build the response
                let response = `You rolled ${tryAmt} times\n\n`;

                for (const [name, count] of resultMap.entries()) {
                    if (count > 0) {
                        response += `${name}: ${count}\n`;
                    }
                }
                await interaction.editReply(response);
            }
        } 
        catch (error) 
        {
            console.error('Issue with testing your luck: ', error);
            await interaction.reply({ content: 'There was a problem with testing your luck!', flags: MessageFlags.Ephemeral });
        }
    },
};
