require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActivityType } = require('discord.js');
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

// --- 2. INITIALIZE DISCORD BOT CLIENT WITH ALL REQUIRED INTENTS ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences // CRITICAL: Fixes bot presence status visibility blocking!
    ]
});

// Helper function to sync status safely
async function updateBotStatus() {
    try {
        const guild = await client.guilds.fetch(process.env.SERVER_ID);
        if (!guild) return;
        
        const totalMembers = guild.memberCount;
        
        // Force explicit updates via the presence manager
        client.user.setPresence({
            activities: [{ 
                name: `Watching over ${totalMembers} members`, 
                type: ActivityType.Watching 
            }],
            status: 'online'
        });
        console.log(`Status synced successfully: Watching ${totalMembers} members.`);
    } catch (error) {
        console.error('Failed to update bot presence status:', error.message);
    }
}

// Define Slash Commands
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong and checks bot latency!'),
    new SlashCommandBuilder()
        .setName('chicago')
        .setDescription('Check the status of Chicago Automations!')
].map(command => command.toJSON());

// --- 3. BOT READY & COMMAND REGISTRATION ---
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Fire right away on connection
    await updateBotStatus();
    
    // Refresh interval loop every 2 minutes
    setInterval(async () => {
        await updateBotStatus();
    }, 1000 * 60 * 2);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('Started refreshing global application (/) commands...');
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
        if (!interaction.replied) {
            await interaction.reply({ content: 'An internal error occurred while processing this automation task.', ephemeral: true });
        }
    }
});

// --- 5. AUTOMATIC WELCOME EVENT & STATUS REFRESH ---
client.on('guildMemberAdd', async (member) => {
    await updateBotStatus();

    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    if (!welcomeChannelId) return;

    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    const totalMembers = member.guild.memberCount;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#00000000')
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

// --- 6. AUTOMATIC REMOVE EVENT ---
client.on('guildMemberRemove', async (member) => {
    await updateBotStatus();
});

client.login(process.env.DISCORD_TOKEN);
