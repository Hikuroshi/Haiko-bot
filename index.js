const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();
const express = require('express');

const app = express();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The Command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

app.get('/register_commands', async (req, res) => {
	const commands = [];

	const foldersPathReg = path.join(__dirname, 'commands');
	const commandFoldersReg = fs.readdirSync(foldersPathReg);

	for (const folder of commandFoldersReg) {
		const commandsPath = path.join(foldersPathReg, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);

			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}

	const rest = new REST().setToken(process.env.TOKEN);

	(async () => {
		try {
			console.log(`Started refreshing ${commands.length} application (/) commands.`);

			const data = await rest.put(
				// Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
				Routes.applicationCommands(process.env.CLIENT_ID),
				{ body: commands },
			);

			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
			res.send(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			console.error(error);
			res.send(error);
		}
	})();
});

app.get('/', async (req, res) => {
	return res.send('Haiko desu');
});


app.listen(3000, () => {
	client.login(process.env.TOKEN);
	console.log(`Express server is running on port ${3000}`);
});