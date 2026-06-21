require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');

// --- 1. START LIGHTWEIGHT WEB SERVER FOR RENDER ---
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('Chicago Automations is Awake and Monitoring!');
});

app.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});

// --- 2. INITIALIZE DISCORD BOT CLIENT WITH MEMBER INTENTS ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ] 
});

// Define Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong and checks bot latency!'),
    new SlashCommandBuilder()
        .setName('chicago')
        .setDescription('Check the status of Chicago Automations!')
].map(command => command.toJSON());

// --- 3. BOT READY & GLOBAL COMMAND REGISTRATION ---
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing global application (/) commands...');
        
        // GLOBAL REGISTRATION: No longer requires a SERVER_ID variable!
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        
        console.log('Successfully reloaded application (/) commands globally!');
        console.log('Chicago Automations is 100% ready!');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
});

// --- 4. HANDLE THE SLASH COMMAND INTERACTIONS ---
client.on('interactionCreate', async interaction => {
    // Stop immediately if it's not a slash text command
    if (!interaction.isChatInputCommand()) return;

    console.log(`Received slash command: /${interaction.commandName}`);

    const { commandName } = interaction;

    try {
        if (commandName === 'ping') {
            await interaction.reply(`Pong! Latency is ${Date.now() - interaction.createdTimestamp}ms.`);
        } else if (commandName === 'chicago') {
            await interaction.reply('Chicago Automations system is fully operational and monitoring server activities.');
        }
    } catch (error) {
        console.error(`Error executing /${commandName}:`, error);
        // Fallback response so it never freezes
        if (!interaction.replied) {
            await interaction.reply({ content: 'An internal error occurred while processing this automation task.', ephemeral: true });
        }
    }
});

// --- 5. AUTOMATIC WELCOME EVENT FROM ENVIRONMENT ---
client.on('guildMemberAdd', async (member) => {
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    if (!welcomeChannelId) {
        console.log('Welcome event skipped: WELCOME_CHANNEL_ID environment variable is missing.');
        return;
    }

    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) {
        console.log(`Welcome channel with ID ${welcomeChannelId} not found in cache.`);
        return;
    }

    const totalMembers = member.guild.memberCount;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setDescription(`👋 Welcome ${member} to **${member.guild.name}**!`);

    const memberCountButton = new ButtonBuilder()
        .setCustomId('member_count')
        .setLabel(`${totalMembers}`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true);

    const row = new ActionRowBuilder().addComponents(memberCountButton);

    channel.send({
        embeds: [welcomeEmbed],
        components: [row]
    });
});

client.login(process.env.DISCORD_TOKEN);
