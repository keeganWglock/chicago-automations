require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// 1. Initialize Bot Client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. Define the Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong and checks bot latency!'),
    new SlashCommandBuilder()
        .setName('chicago')
        .setDescription('Check the status of Chicago Automations!')
].map(command => command.toJSON());

// 3. Register Commands with Discord when the bot starts
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        // This registers commands globally across all servers your bot is in
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
        console.log('Chicago Automations is 100% ready!');
    } catch (error) {
        console.error(error);
    }
});

// 4. Handle the Slash Command Interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply(`Pong! Latency is ${Date.now() - interaction.createdTimestamp}ms.`);
    } else if (commandName === 'chicago') {
        await interaction.reply('Chicago Automations system is fully operational and monitoring server activities.');
    }
});

client.login(process.env.DISCORD_TOKEN);
