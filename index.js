require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
        GatewayIntentBits.GuildMembers // Required to detect when someone joins!
    ] 
});

// Run when the bot logs in
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Chicago Automations is 100% ready!');
});

// --- 3. AUTOMATIC WELCOME EVENT ---
client.on('guildMemberAdd', async (member) => {
    // CHANGE THIS: Replace with your actual Welcome Channel ID string
    const welcomeChannelId = '1443803363602075781'; 
    
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    // Fetch total members in the server
    const totalMembers = member.guild.memberCount;

    // Create the clean Welcome Embed Card matching your design
    const welcomeEmbed = new EmbedBuilder()
        .setColor('#FF0000') // Bright red matching your example buttons
        .setDescription(`👋 Welcome ${member} to **${member.guild.name}**!`);

    // Create the member count indicator button underneath
    const memberCountButton = new ButtonBuilder()
        .setCustomId('member_count')
        .setLabel(`${totalMembers}`) // Displays the raw user count number
        .setStyle(ButtonStyle.Danger) // Red button style
        .setDisabled(true); // Keeps it as a non-clickable layout block like your image

    const row = new ActionRowBuilder().addComponents(memberCountButton);

    // Send the card directly to your channel
    channel.send({
        embeds: [welcomeEmbed],
        components: [row]
    });
});

client.login(process.env.DISCORD_TOKEN);
