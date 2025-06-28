const { Events } = require('discord.js');
const { gemini } = require('../commands/utility/gemini.js');
const { context } = require('../commands/utility/context');

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
            await message.reply(`https://tenor.com/view/do-not-ping-staff-no-reason-discord-discord-rules-gif-17679038`);
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

        let replyHist = 0;

        // checks if user replies to bot message
        if (message.reference)
        {
            replyHist++;
            // fetches the message being replied to 
            const botReply = await message.channel.messages.fetch(message.reference.messageId);
            const userReply = message.content;
            
            // prevent double responses if message is not sent by bot
            if (botReply.author.id !== message.client.user.id) return;
            const messages = await context(message.channel, replyHist);

            let prompt = 'Respond to the reply in a short paragraph and use the message context as needed.';

            console.log(`${message.author.tag} replied to bot`);
            if (messages)
            {
                prompt += `\nContext:\n${messages}`;
            }
            prompt += `\nUser Replied:\n${userReply}`;
            
            const aiReply = await gemini(prompt);
            await message.reply(aiReply);
        }

        /*
        Easter eggs when someone sends a message in chat:
        When someone sends 727
        When someone sends hesitation
        */ 
        // const sekiro = 'hesitation';
        const osu = '727';
        
        if (message.guild && message.content.includes(osu))
        {
            console.log(`message: ${message.content}`);
            await message.reply(`https://tenor.com/view/wysi-727-osu-gif-26190979`);
        }
        // if (message.guild && message.content.toLowerCase().includes(sekiro))
        // {
        //     console.log(`message: ${message.content}`);
        //     await message.reply(`"Hesitation is defeat"`);
        // }
    },
};