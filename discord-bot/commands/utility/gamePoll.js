const { SlashCommandBuilder, EmbedBuilder, MessageFlags, AttachmentBuilder } = require('discord.js');
const chrono = require('chrono-node');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pollgame')
        .setDescription('Creates a poll for various games')

            .addStringOption(option =>
                option
                .setName('game')
                .setDescription('Select a game to poll')
                .addChoices(
                    { name: 'Valorant', value: 'Valorant' },
                    { name: 'CS2', value: 'CS2' },
                    { name: 'Rainbow 6 Siege', value: 'Rainbow-6-Siege' },
                    { name: 'Party Game', value: 'Party-Game' },
                )
                .setRequired(true))
            
            // add number of players 
            .addIntegerOption(option =>
                option
                .setName('players')
                .setDescription('Number of players you would like')
                .setRequired(true))

            // add a time limit option to end the poll
            .addStringOption(option =>
                option
                .setName('time')
                .setDescription('Enter a time for when the game should start')
                .setRequired(true))

            // OPTIONAL: add a mentionable role
            .addMentionableOption(option => 
                option
                .setName('mention')
                .setDescription('Add a role to ping')
                .setRequired(false))

            // OPTIONAL: add a description to the poll
            .addStringOption(option =>
                option
                .setName('description')
                .setDescription('Add a custom description to the poll')
                .setRequired(false))

            // OPTIONAL: set an option to dm the users who voted only if there is a time limit
            .addBooleanOption(option =>
                option
                .setName('dm')
                .setDescription("Send DM's to the players who voted")
                .setRequired(false)),

    async execute(interaction) 
    {   
        await interaction.deferReply();

        const game = interaction.options.getString('game');
        const players = interaction.options.getInteger('players');
        const time = interaction.options.getString('time');
        const mention = interaction.options.getMentionable('mention') ?? null;
        let description = interaction.options.getString('description') ?? '';
        const dm = interaction.options.getBoolean('dm') ?? false;
        const embedPoll = new EmbedBuilder();

        const imagePath = path.join(__dirname, '..', '..', `./imgAssets/${game}.png`);
        const attachment = new AttachmentBuilder(imagePath, { name: `${game}.png` });

        // create the inital embed poll
        try {
            // required fields
            embedPoll
                .setColor("White")
                .setTitle(`${game}`)
                .setAuthor({ name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL({ extension: 'jpg' }) })
                .setThumbnail(`attachment://${game}.png`)
                .addFields(
                    { name: `Looking for players:`, value: `${players}`, inline: true },
                )
                .setTimestamp();

                // if dm is not empty assign dm option to the embed 
                if (dm) {
                    embedPoll.addFields({ name: `Notifications:`, value: 'On', inline: true });
                } else {
                    embedPoll.addFields({ name: `Notifications:`, value: 'Off', inline: true });
                }

        } catch (error) {
            console.log('There was an error with creating the initial poll: ', error);
            await interaction.reply({ content: 'There was an error trying to create your poll!', flags: MessageFlags.Ephemeral });
            return;
        }
        
        // Set a timeout for the time to play
        try {

            // check if valid time format
            const setTime = chrono.parseDate(time);
            if (!setTime) {
                await interaction.editReply({ content: 'Invalid time format provided!', ephemeral: true });
                return;
            }
            
            // check if time is in the past
            const msUntilPollEnds = setTime.getTime() - Date.now();
            if (msUntilPollEnds <= 0) {
                await interaction.editReply({ content: 'The specified time is in the past!', ephemeral: true });
                return;
            }

            const unixTimestamp = Math.floor(setTime.getTime() / 1000);
            embedPoll.setDescription(description += `\n\n**Time we play: <t:${unixTimestamp}:t>**\n`);

            // check if there is a mentionable object
            if (mention) {
                await interaction.editReply({ content: `${mention}`, embeds: [embedPoll], files: [attachment] });
            } else {
                await interaction.editReply({ embeds: [embedPoll], files: [attachment] });
            }
            
            const pollMessage = await interaction.fetchReply();
            await pollMessage.react('✅'); // yes
            await pollMessage.react('❌'); // no
            await pollMessage.react('❓'); // maybe
            
            setTimeout(async () => {
                const yesVotes = await pollMessage.reactions.cache.get('✅')?.users.fetch();
                // Edit embed to indicate poll is closed
                const closedEmbed = EmbedBuilder.from(pollMessage.embeds[0])
                    .setFooter({ text: 'Poll closed' })
                    .setColor('Red')
                    .setThumbnail(`attachment://${game}.png`);

                await pollMessage.edit({ embeds: [closedEmbed] });

                // Remove all reactions to lock further voting
                await pollMessage.reactions.removeAll();

                // check if dm is true and send dm to all users except bots 
                if (dm) {
                    const sendDMs = async (users) => {
                        users?.forEach(user => {
                            if (!user.bot) {
                                user.send(`It's time to play **${game}**!`);
                            }
                        });
                    };
                    sendDMs(yesVotes, 'Yes');
                }
            }, msUntilPollEnds);
        } catch (error) {
            console.log('Issue with setting time', error);
            await interaction.editReply({ content: 'There was an error!', flags: MessageFlags.Ephemeral });
        }
    },
};