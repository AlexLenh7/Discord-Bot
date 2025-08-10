const { SlashCommandBuilder, EmbedBuilder, MessageFlags, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const chrono = require('chrono-node');
const path = require('path');
const { DateTime } = require('luxon');

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
                    { name: 'Battlefield 6', value: 'Battlefield-6' },
                    { name: 'Party Game', value: 'Party-Game' },
                )
                .setRequired(true))
            
            // add number of players 
            .addIntegerOption(option =>
                option
                .setName('players')
                .setDescription('Number of players you would like to play')
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

        // custom button to cancel poll early
        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('End Poll')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(cancel);

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
            const laNow = DateTime.now().setZone('America/Los_Angeles');
            const instantDate = laNow.toJSDate();

            const parsedDate = chrono.parseDate(time, { instant: instantDate }); // no timezone option here
            if (!parsedDate) {
                await interaction.editReply({ content: 'Invalid time format provided!', ephemeral: true });
                return;
            }

            // parsedDate is a JS Date in the server’s local timezone (probably UTC or something else)
            // So create a Luxon DateTime from it **AS IF** it is in America/Los_Angeles time zone:
            let laSetTime = DateTime.fromJSDate(parsedDate).setZone('America/Los_Angeles', { keepLocalTime: true });

            // If the parsed time is before now, assume the next day
            if (laSetTime <= laNow) {
                laSetTime = laSetTime.plus({ days: 1 });
            }

            // Now compute milliseconds until poll ends
            const msUntilPollEnds = laSetTime.toMillis() - laNow.toMillis();

            if (msUntilPollEnds <= 0) {
                await interaction.editReply({ content: 'The specified time is in the past!', ephemeral: true });
                return;
            }

            const unixTimestamp = Math.floor(laSetTime.toSeconds());

            embedPoll.setDescription(description += `\n\n**Time we play: <t:${unixTimestamp}:t>**\n`);

            // check if there is a mentionable object
            if (mention) {
                await interaction.editReply({ content: `${mention}`, embeds: [embedPoll], files: [attachment], components: [row], allowedMentions: { roles: [mention.id] } });
            } else {
                await interaction.editReply({ embeds: [embedPoll], files: [attachment], components: [row] });
            }
            
            const pollMessage = await interaction.fetchReply();
            await pollMessage.react('✅'); // yes
            await pollMessage.react('❌'); // no
            await pollMessage.react('❓'); // maybe 
            
            // allow interactions after message creation
            // Shared function to end the poll (from timeout or cancel button)
            const endPoll = async (source = 'timeout') => {
                const yesVotes = await pollMessage.reactions.cache.get('✅')?.users.fetch();

                const closedEmbed = EmbedBuilder.from(pollMessage.embeds[0])
                    .setFooter({ text: 'Poll closed' + (source === 'button' ? ' (manually)' : '') })
                    .setColor('Red')
                    .setThumbnail(`attachment://${game}.png`);

                await pollMessage.edit({
                    embeds: [closedEmbed],
                    components: [], // Remove button
                });

                await pollMessage.reactions.removeAll();

                if (dm) {
                    yesVotes?.forEach(user => {
                        if (!user.bot) {
                            user.send(`It's time to play **${game}**!`);
                        }
                    });
                }
            };

            // Set up the timeout
            const timeout = setTimeout(() => endPoll('timeout'), msUntilPollEnds);

            // Set up the collector for the "End Poll" button
            const collector = pollMessage.createMessageComponentCollector({
                componentType: 2, // Button
                time: msUntilPollEnds,
            });

            collector.on('collect', async i => {
                if (i.customId === 'cancel') {
                    // Optional: check if user has permission to end the poll
                    if (i.user.id !== interaction.user.id) {
                        await i.reply({ content: "Only the poll creator can end it early.", ephemeral: true });
                        return;
                    }

                    clearTimeout(timeout); // Cancel the timeout
                    collector.stop(); // Stop collector so it doesn’t trigger twice
                    await i.update({ content: "Poll has been manually ended.", components: [] });
                    await endPoll('button');
                }
            });

        } catch (error) {
            console.log('Issue with setting time', error);
            await interaction.editReply({ content: 'There was an error!', flags: MessageFlags.Ephemeral });
        }
    },
};