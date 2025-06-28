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
                    { name: 'Anime memes', value: 'Animemes' },
                    { name: 'relatable memes', value: 'me_irl' },
                    { name: 'dank memes', value: 'dankmemes' },
                    { name: 'General memes', value: 'memes' },
                )
                .setRequired(false))

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
                const isImage = data.post_hint === "image";
                return isImage;
            });

            // return null if no posts were found
            if (imagePosts.length === 0)
            {
                console.log('No image posts found.');
                return null;
            } 
            else
            {
                const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
                return { url: randomPost.data.url, title: randomPost.data.title }; // returns an object
            }
        }

        const search = interaction.options.getString('search');
        const subreddit = interaction.options.getString('type');
        let redditUrl = "";

        // if search is empty and type of meme is empty proceed with random meme
        if (!search && !subreddit)
        {
            // hold an array of subreddits to randomly pick
            const subreddits = [
                'memes',
                'dankmemes',
                'Animemes',
                'me_irl',
            ];

            // pick the random subreddit if no string option for is provided for subredit
            const rand = Math.floor(Math.random() * subreddits.length);
            const randomSub = subreddits[rand];

            // grab a random posts from the last week
            redditUrl = `https://www.reddit.com/r/${randomSub}/top/.json?t=week&limit=1000`;
        }
        // search and subreddit
        else if (search && subreddit)
        {
            redditUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${search}&sort=top&t=month&limit=1000`;
        }
        // search without subreddit
        else if (search && !subreddit)
        {
            const encodedQuery = encodeURIComponent(`${search} meme`);
            redditUrl = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=relevance&t=month&limit=1000`;
        }
        // no search but just subreddit
        else if (!search && subreddit)
        {
            redditUrl = `https://www.reddit.com/r/${subreddit}/top/.json?t=month&limit=1000`;
        }
        try
        {
            const img = await getImage(redditUrl);
            
            const embed = new EmbedBuilder()
                .setColor("White")
                .setImage(img.url)
                .setTitle(img.title);

            await interaction.reply({ embeds: [embed] });
        } 
        catch (error)
        {
            console.error('Meme command error: ', error);
            await interaction.reply({ content: 'There was a problem with meme', flags: MessageFlags.Ephemeral });
        }
    },
};
