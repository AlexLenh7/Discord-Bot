const { Events } = require('discord.js');
const { gemini } = require('../commands/utility/gemini.js');

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
            const birthday = [
                "Happy birth",
                "Happy unc day",
                "One year closer to your death :)",
                "Damn you old as hell",
            ];
            const random = Math.floor(Math.random() * birthday.length);
            // grab the first instance of user being mentioned
            const userBirth = message.mentions.users.first();
            console.log(`There was a birthday for ${userBirth.tag}`);
            await message.channel.send(`${userBirth.tag} ${birthday[random]} `);
        }

        // checks if user replies to bot message
        if (message.reference)
        {
            const replied = await message.channel.messages.fetch(message.reference.messageId);

            // check if message was sent by bot
            if (replied.author.id === message.client.user.id)
            {
                console.log(`${message.author.tag} replied to bot`);
                const aiReply = await gemini(`Respond in exactly one sentence with Gen Z humor — unhinged, ironic, and straight to the point. 
                    No side tangents, no explanations. Just roast, relate, or react like a cursed TikTok comment using common popular emojis.  
                    ${message.content}`);
                await message.reply(aiReply);
            }
        }

        // easter egg when someone sends 727
        if (message.guild && message.content === '727')
        {
            console.log(`message: ${message.content}`);
            await message.reply(`https://tenor.com/view/wysi-727-osu-gif-26190979`);
        }
    },
};