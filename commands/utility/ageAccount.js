const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('age')
		.setDescription('Information about account age')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The user target')),
	async execute(interaction) {
		const user = interaction.options.getUser('target');
		const interactionUser = user ?? interaction.user;

		const birthday = new Date(interactionUser.createdAt);
		const now = new Date();

		const ageDifMs = now - birthday;
		const ageDate = new Date(ageDifMs);

		const years = ageDate.getUTCFullYear() - 1970;
		const months = ageDate.getUTCMonth();
		const days = ageDate.getUTCDate() - 1;
		const hours = ageDate.getUTCHours();

		const nextBirthday = new Date(now.getFullYear(), birthday.getUTCMonth(), birthday.getUTCDate(), birthday.getUTCHours());
		if (nextBirthday < now) {
			nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
		}

		const timeNextBirthday = nextBirthday - now;
		const timeNextBirthdayDate = new Date(timeNextBirthday);

		// const yearsNext = timeNextBirthdayDate.getUTCFullYear() - 1970;
		const monthsNext = timeNextBirthdayDate.getUTCMonth();
		const daysNext = timeNextBirthdayDate.getUTCDate() - 1;
		const hoursNext = timeNextBirthdayDate.getUTCHours();

		const getText = (value, unit) => `${value} ${value < 2 ? unit : unit + 's'}`;

		const embedMessage = new EmbedBuilder()
			.setTitle('Account age')
			.addFields(
				{ name: 'Age', value: `${getText(years, 'year')} | ${getText(months, 'month')} | ${getText(days, 'day')} | ${getText(hours, 'hour')}` },
				{ name: 'Next birthday', value: `${getText(monthsNext, 'month')} | ${getText(daysNext, 'day')} | ${getText(hoursNext, 'hour')}` },
				// { name: 'Summary', value: `${getText(yearsSummary, 'year')} | ${getText(monthsSummary, 'month')} | ${getText(daysSummary, 'day')} | ${getText(hoursSummary, 'hour')} | ${getText(minutesSummary, 'minute')}` },
			)
			.setColor('#a0919e')
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL(),
			});

		await interaction.reply({ embeds: [embedMessage] });
	},
};