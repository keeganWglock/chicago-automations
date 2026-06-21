require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

// --- 1. START LIGHTWEIGHT WEB SERVER FOR RENDER ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Chicago Automations is Awake and Monitoring!');
});

app.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});

// --- 2. INITIALIZE DISCORD BOT CLIENT ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Define Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong and checks bot latency!'),
    new SlashCommandBuilder()
        .setName('chicago')
        .setDescription('Check the status of Chicago Automations!')
].map(command => command.toJSON());

// Register Commands with Discord when the bot starts
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
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

// Handle Slash Command Interactions
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
