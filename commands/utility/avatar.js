const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get avatar from user')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The user target')),
	async execute(interaction) {
		const user = interaction.options.getUser('target');
		const interactionUser = user ?? interaction.user;

		const embedMessage = new EmbedBuilder()
			.setDescription(`Avatar from ${interactionUser.toString()}`)
			.setImage(interactionUser.displayAvatarURL({ size: 4096 }))
			.setColor('#a0919e')
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL(),
			});

		await interaction.reply({ embeds: [embedMessage] });
	},
};