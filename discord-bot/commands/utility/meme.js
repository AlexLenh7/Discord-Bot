const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('generate a random meme from reddit'),
    
    async execute(interaction)
    {
        // hold an array of subreddits to randomly pick
        const subreddits = [
            'memes',
            'dankmemes',
            'Animemes',
            'me_irl',
            'ProgrammerHumor',
        ];

        // pick the random subreddit
        const rand = Math.floor(Math.random() * subreddits.length);

        const subreddit = subreddits[rand];

        // grab posts from the last week
        const redditurl = `https://www.reddit.com/r/${subreddit}/top/.json?t=week&limit=100`;

        try 
        {
            // grab the subreddit in json format
            const response = await fetch(redditurl);
            const json = await response.json();

            // access post data
            const posts = json.data.children;

            // callback function to filter posts for image
            const imagePosts = posts.filter((post) => {
                const data = post.data;
                const isImage = data.post_hint === "image";
                return isImage && !data.is_video;
            });

            if (imagePosts.length === 0)
            {
                console.log('No image posts found.');
            } 
            else
            {
                const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
                const url = randomPost.data.url;
                await interaction.reply(url);
            }

        } 
        catch (error)
        {
            console.error('Issue with setting reminder ', error);
            await interaction.reply({ content: 'There was a problem with meme', flags: MessageFlags.Ephemeral });
        }
    },
};