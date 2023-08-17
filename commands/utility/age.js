const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DateTime } = require('luxon');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('age')
		.setDescription('Information about age')
		.addSubcommand(subcommand =>
			subcommand
				.setName('account')
				.setDescription('Information about age account')
				.addUserOption(option =>
					option
						.setName('target')
						.setDescription('The user target')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('in-guild')
				.setDescription('Information about age account in this guild')
				.addUserOption(option =>
					option
						.setName('target')
						.setDescription('The user target')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('guild')
				.setDescription('Information about age guild'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('mine')
				.setDescription('Information about your age')
				.addIntegerOption(option =>
					option
						.setName('year')
						.setDescription('Year of your birth')
						.setMinValue(1)
						.setMaxValue(DateTime.now().minus({ year: 1 }).year)
						.setRequired(true))
				.addIntegerOption(option =>
					option
						.setName('month')
						.setDescription('Month of your birth')
						.setMinValue(1)
						.setMaxValue(12)
						.setRequired(true))
				.addIntegerOption(option =>
					option
						.setName('day')
						.setDescription('Day of your birth')
						.setMinValue(1)
						.setMaxValue(31)
						.setRequired(true))),
	async execute(interaction) {
		let dateBirth, titleOption;
		if (interaction.options.getSubcommand() === 'account') {
			const user = interaction.options.getUser('target');
			const interactionUser = user ?? interaction.user;

			dateBirth = interactionUser.createdAt;
			titleOption = 'Age Account';
		} else if (interaction.options.getSubcommand() === 'in-guild') {
			const user = interaction.options.getMember('target');
			const interactionUser = user ?? interaction.member;

			dateBirth = interactionUser.guild.joinedAt;
			titleOption = 'Age In Guild';
		} else if (interaction.options.getSubcommand() === 'guild') {
			dateBirth = await interaction.member.guild.createdAt;
			titleOption = 'Age Guild';
		} else if (interaction.options.getSubcommand() === 'mine') {
			const yearDate = interaction.options.getInteger('year');
			const monthDate = interaction.options.getInteger('month');
			const dayDate = interaction.options.getInteger('day');

			dateBirth = DateTime.local(yearDate, monthDate, dayDate).toJSDate();
			titleOption = 'Your Age';
		}

		const birthDate = DateTime.fromJSDate(dateBirth);
		const currentDate = DateTime.now();
		let nextBirthday = birthDate.set({ year: currentDate.year });

		if (nextBirthday < currentDate) {
			nextBirthday = nextBirthday.plus({ year: 1 });
		}

		const units = ['years', 'months', 'weeks', 'days', 'hours', 'minutes'];

		const diff = currentDate.diff(birthDate, units);
		const { years, months, weeks, days, hours, minutes } = diff.toObject();

		const diffNext = nextBirthday.diff(currentDate, units);
		const { years: yearsNext, months: monthsNext, weeks: weeksNext, days: daysNext, hours: hoursNext, minutes: minutesNext } = diffNext.toObject();

		const getDiff = (unit) => Math.floor(currentDate.diff(birthDate, unit).toObject()[unit]);
		const summaries = units.reduce((obj, unit) => {
			obj[unit] = getDiff(unit);
			return obj;
		}, {});

		const getText = (value, unit) => `${value} ${value < 2 ? unit : unit + 's'}`;

		const embedMessage = new EmbedBuilder()
			.setTitle(titleOption)
			.addFields(
				{ name: 'Age', value: `${getText(years, 'year')} | ${getText(months, 'month')} | ${getText(weeks, 'week')} | ${getText(days, 'day')} | ${getText(hours, 'hour')} | ${getText(Math.floor(minutes), 'minute')}` },
				{ name: 'Next birthday', value: `${getText(yearsNext, 'year')} | ${getText(monthsNext, 'month')} | ${getText(weeksNext, 'week')} | ${getText(daysNext, 'day')} | ${getText(hoursNext, 'hour')} | ${getText(Math.floor(minutesNext), 'minute')}` },
				{ name: 'Summary', value: `${getText(summaries.years, 'year')} | ${getText(summaries.months, 'month')} | ${getText(summaries.weeks, 'week')} | ${getText(summaries.days, 'day')} | ${getText(summaries.hours, 'hour')} | ${getText(summaries.minutes, 'minute')}` },
			)
			.setColor('#a0919e')
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL(),
			});

		await interaction.reply({ embeds: [embedMessage] });
	},
};