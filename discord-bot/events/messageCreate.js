const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message)
    {
        // personal info
        const userId = '137368456550023168';
        const owner = await message.client.users.fetch(userId);
        
        // ignore messages from other bots
        if (message.author.bot) return;

        // check if message is a DM
        if (!message.guild)
        {
            console.log(`📬 DM from ${message.author.tag}: "${message.content}"`);
            await owner.send(`📬 DM from ${message.author.tag}: "${message.content}"`);
        }

        // check if message pings me
        if (message.mentions.has(userId))
        {
            console.log(`[Pinged] ${message.author.tag} mentioned you: ${message.content}`);
            console.log(`In channel: ${message.channel.name}`);
            console.log(`Time sent: ${message.createdAt.toDateString()}`);
            await message.reply(`If Alex does not respond to this message then I probably saw it`);
        }
        
        // happy birthday messages
        // check if message is sent by the bot in birthday channel and mentions the user
        const birthChannel = '1021631920699887636';
        if (message.author.bot && 
            message.channel.id === birthChannel && 
            message.mentions.size > 0)
        {
            // grab the first instance of user being mentioned
            const userBirth = message.mentions.users.first();
            console.log(`There was a birthday for ${userBirth.tag}`);
            await message.channel.send(`Happy Birthday ${userBirth.tag}!`);
        }
    },
};