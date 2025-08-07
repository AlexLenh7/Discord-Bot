const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas } = require('@napi-rs/canvas');
// const { readFile } = require('fs/promises');
const Canvas = require('@napi-rs/canvas');
const { level } = require('../../models/level');
 
module.exports = 
{
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Displays the current rank and xp needed to level up'),

    async execute(interaction) 
    {
		// find the user who used the command
		const userRank = await level.findOne({
			where: {
				userId: interaction.user.id,
			},
		});

        // Create a 700x250 pixel canvas and get its context
		// The context will be used to modify the canvas
		const canvas = createCanvas(500, 150);
		const context = canvas.getContext('2d');

		const background = await Canvas.loadImage('./imgAssets/background.jpg');
		context.drawImage(background, 0, 0, canvas.width, canvas.height);

		// create a border around the canvas
		// context.strokeStyle = '#0099ff';
		// context.lineWidth = 10;
		// context.strokeRect(0, 0, canvas.width, canvas.height);

		// text styles for displaying rank
		context.font = '15px Coolvetica';
		context.fillStyle = '#ffffff';
		context.textAlign = 'center'; // center text horizontally
		context.textBaseline = 'middle'; // center text vertically
		context.fillText(`${userRank.rank.toUpperCase()}`, canvas.width * 0.625, canvas.height * 0.5);

		// text styles for username
		let displayName = `${interaction.member.displayName}`;
		const maxWidth = 300;
		context.font = '30px Coolvetica';
		if (context.measureText(displayName).width > maxWidth) {
		// Truncate and add ellipsis
			while (context.measureText(displayName + '...').width > maxWidth) {
				displayName = displayName.slice(0, -1);
			}
			displayName += '...';
		}
		context.fillStyle = '#ffffff';
		context.textAlign = 'center'; // center text horizontally
		context.textBaseline = 'middle'; // center text vertically
		context.fillText(`${displayName}`, canvas.width * 0.625, canvas.height * 0.3);
		
		// draw the xp bar
		const barWidth = 300;
		const barHeight = 16;
		const barX = canvas.width - barWidth - 40;
		const barY = canvas.height - 40;

		const progress = userRank.nextXp === 0 ? 1 : 1 - (userRank.nextXp / (userRank.xp + userRank.nextXp));

		// bar fill
		context.fillStyle = '#ffffff';
		context.fillRect(barX, barY, barWidth, barHeight);

		// progress fill
		context.fillStyle = '#2E58FF';
		context.fillRect(barX, barY, barWidth * progress, barHeight);

		// Border (optional)
		// context.strokeStyle = '#0099ff';
		// context.strokeRect(barX, barY, barWidth, barHeight);

		// text styles for current xp and next xp
		context.font = '15px Coolvetica';
		context.fillStyle = '#ffffff';
		context.textAlign = 'right';
		context.textBaseline = 'middle';
		context.fillText(`${userRank.xp} / ${userRank.nextXp + userRank.xp} XP`, barX + barWidth, barY - 10);

		// draw the circle for the profile picture
		context.save();
		context.beginPath();
		context.arc(75, 75, 50, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

		// load the image into the circle
		const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL({ extension: 'jpg' }));
		context.drawImage(avatar, 25, 25, 100, 100);

		context.restore();

		const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });

		await interaction.reply({ files: [attachment] });
    },
};