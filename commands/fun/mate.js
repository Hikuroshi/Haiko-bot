const { SlashCommandBuilder, EmbedBuilder, codeBlock } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mate')
		.setDescription('Find your most suitable match')
		.addSubcommand(subcommand =>
			subcommand.setName('choice')
				.setDescription('Find mate by selecting user')
				.addUserOption(option =>
					option.setName('target-1')
						.setDescription('The first user target')
						.setRequired(true))
				.addUserOption(option =>
					option.setName('target-2')
						.setDescription('The second user target')))
		.addSubcommand(subcommand =>
			subcommand.setName('random')
				.setDescription('Find random mate by selecting role')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('Find mate in this role')
						.setRequired(true))),
	async execute(interaction) {
		let user1, user2, userMatch;

		if (interaction.options.getSubcommand() === 'choice') {
			user1 = interaction.options.getUser('target-1');
			user2 = interaction.options.getUser('target-2');
			userMatch = user2 ?? interaction.user;

		} else if (interaction.options.getSubcommand() === 'random') {
			const selectedRole = interaction.options.getRole('role');
			userMatch = interaction.user;

			if (selectedRole.members.size > 1) {
				const randomMate = selectedRole.members.random();
				user1 = randomMate.user;
			} else {
				await interaction.reply({ embeds: [{
					color: 0xa0919e,
					description: `Nothing user in ${selectedRole.toString()}`,
				}] });
				return;
			}
		}

		function sumUnicodeCodes(...strings) {
			const total = strings.reduce((sum, str) =>
				sum + [...str].reduce((acc, char) => acc + char.charCodeAt(0), 0), 0);

			const percentage = (total % 100) + 5;
			return percentage;
		}

		const mateKeywords = ['Love', 'Affection', 'Cheat', 'Fight', 'Loyal', 'Match', 'Sincere', 'Care'];
		const percentages = {};

		for (const mateKeyword of mateKeywords) {
			const totalUnicodeSum = sumUnicodeCodes(userMatch.username, user1.username, mateKeyword);
			percentages[mateKeyword] = totalUnicodeSum;
		}

		const embedMessage = new EmbedBuilder()
			.setTitle('Couple Counter')
			.setDescription(`Match results between ${userMatch.toString()} and ${user1.toString()}`)
			.addFields(
				{ name: 'Love', value: codeBlock(`${percentages.Love}%`), inline: true },
				{ name: 'Affection', value: codeBlock(`${percentages.Affection}%`), inline: true },
				{ name: 'Cheat', value: codeBlock(`${percentages.Cheat}%`), inline: true },
				{ name: 'Fight', value: codeBlock(`${percentages.Fight}%`), inline: true },
				{ name: 'Loyal', value: codeBlock(`${percentages.Loyal}%`), inline: true },
				{ name: 'Match', value: codeBlock(`${percentages.Match}%`), inline: true },
				{ name: 'Sincere', value: codeBlock(`${percentages.Sincere}%`), inline: true },
				{ name: 'Care', value: codeBlock(`${percentages.Care}%`), inline: true },
			)
			.setColor('#a0919e')
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL(),
			});

		await interaction.reply({ embeds: [embedMessage] });
	},
};