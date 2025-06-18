const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('generate a random meme from reddit')

            .addStringOption(option =>
                option
                .setName('search')
                .setDescription('search for a specific meme topic')
                .setRequired(false)),
    
    async execute(interaction)
    {
        async function getImage(redditUrl)
        {
            // grab the subreddit in json format
            const response = await fetch(redditUrl);
            const json = await response.json();

            // access post data
            const posts = json.data.children;

            // callback function to filter posts for image
            const imagePosts = posts.filter((post) => {
                const data = post.data;
                const isImageorVideo = data.post_hint === "image" || data.post_hint === "hosted:video";
                return isImageorVideo;
            });

            if (imagePosts.length === 0)
            {
                console.log('No image posts found.');
                return null;
            } 
            else
            {
                const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
                return randomPost.data.url;
            }
        }

        // if search is empty proceed with random meme
        if (!interaction.options.getString('search'))
        {
            // hold an array of subreddits to randomly pick
            const subreddits = [
                'memes',
                'dankmemes',
                'Animemes',
                'me_irl',
            ];

            // pick the random subreddit
            const rand = Math.floor(Math.random() * subreddits.length);

            const subreddit = subreddits[rand];

            // grab posts from the last week
            const redditUrl = `https://www.reddit.com/r/${subreddit}/top/.json?t=week&limit=100`;

            try 
            {
                const img = await getImage(redditUrl);

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setImage(img);

                await interaction.reply({ embeds: [embed] });
            } 
            catch (error)
            {
                console.error('Issue with setting reminder ', error);
                await interaction.reply({ content: 'There was a problem with meme', flags: MessageFlags.Ephemeral });
            }
        }
        else
        {
            const search = interaction.options.getString('search');
            const encodedQuery = encodeURIComponent(`${search} meme`);
            const redditUrl = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=relevance&t=month&limit=100`;
            
            try
            {
                const img = await getImage(redditUrl);
                
                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setImage(img);

                await interaction.reply({ embeds: [embed] });
            } 
            catch (error)
            {
                console.error('Issue with searching meme ', error);
                await interaction.reply({ content: 'There was a problem with meme', flags: MessageFlags.Ephemeral });
            }
        }
    },
};
