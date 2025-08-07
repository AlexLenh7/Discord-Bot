const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('generate a random meme from reddit')
        
            .addStringOption(option =>
                option
                .setName('type')
                .setDescription('search within a specific subreddit')
                .addChoices(
                    { name: 'Anime', value: 'Animemes' },
                    { name: 'Relatable', value: 'me_irl' },
                    { name: 'Dank', value: 'dankmemes' },
                    { name: 'General', value: 'memes' },
                )
                .setRequired(false)),
    
    async execute(interaction)
    {
        const subreddit = interaction.options.getString('type');

        // if no subreddit selected do a random one
        const subreddits = ['memes', 'dankmemes', 'Animemes', 'me_irl'];   
        const selectSub = subreddit || subreddits[Math.floor(Math.random() * subreddits.length)];

        const memeUrl = `https://meme-api.com/gimme/${selectSub}`;

        try {
            // fetch the contents 
            const response = await fetch(memeUrl);
            const contentType = response.headers.get("content-type");

            if (!response.ok || !contentType?.includes("application/json")) {
                const errorText = await response.text();
                console.error("Meme API returned non-JSON:", errorText.slice(0, 200));
                throw new Error("Meme API did not return JSON");
            }

            const data = await response.json();

            // check if valid
            if (!data.url || !data.title) {
                throw new Error("Invalid meme data returned");
            }

            const embed = new EmbedBuilder()
                .setColor("White")
                .setTitle(data.title)
                .setURL(data.postLink)
                .setImage(data.url)
                .setFooter({ text: `From r/${data.subreddit} ⬆️ ${data.ups}` });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Meme command error:', error);
            await interaction.reply({ content: 'There was a problem with meme', flags: MessageFlags.Ephemeral });
        }
    },
};
