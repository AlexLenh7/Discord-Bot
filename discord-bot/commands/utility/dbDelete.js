const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { website } = require('../../models/websites.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Provide a title to an entry for checking stock OR deletes all entries if no title is provided!')

        .addStringOption(option =>
            option
            .setName('title')
            .setDescription('Provide the title of your entry you want to delete')
            .setRequired(false)),
    
    async execute(interaction)
    {
        try {
            const user = interaction.user;
            const rawtitle = interaction.options.getString('title');
            const title = rawtitle?.toLowerCase() || null;

            const all = await website.findAll({
                where: {
                    userId: user.id,
                },
            });

            const exists = await website.findOne({
                where: {
                    userId: user.id,
                    title: title,
                },
            });

            // if title string is null then destroy all entries
            if (!title && all.length != 0)
            {
                for (const entry of all)
                {
                    await entry.destroy();
                }
                return await interaction.reply({ content: `Successfully destroyed all entries`, flags: MessageFlags.Ephemeral });
            }

            if (exists)
            {
                const link = exists.website;
                await exists.destroy();
                await interaction.reply({ content: `Successfully untracked: **${title}**\n${link}`, flags: MessageFlags.Ephemeral });
            }
            else
            {
                await interaction.reply({ content: 'Could not find your entry. Make sure you type the exact title!', flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            console.log('There was an error trying to delete your entry! ', error);
        }
    },
};