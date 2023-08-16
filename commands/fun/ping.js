const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');

module.exports = {
	cooldown: 10,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Check Haiko ping'),
	async execute(interaction) {
		const sent = await interaction.deferReply({ ephemeral: true, fetchReply: true });

		const embedMessage = new EmbedBuilder()
			.setTitle('Pong!')
			.addFields(
				{ name: '⏱️ Roundtrip latency ⏱️', value: codeBlock(`${sent.createdTimestamp - interaction.createdTimestamp}ms`) },
				{ name: '💓 Websocket heartbeat 💓', value: codeBlock(`${interaction.client.ws.ping}ms`) },
			)
			.setColor('#a0919e');

		await interaction.editReply({ embeds: [embedMessage] });
	},
};