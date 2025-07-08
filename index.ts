import { REST, Routes, Client, Events, GatewayIntentBits } from 'discord.js'
import * as dotenv from 'dotenv';
import { commands } from "./src/commands";
import { handleInteraction } from "./src/interactions";

dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error('Missing TOKEN or CLIENT_ID in environment variables.');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates // Ensure this intent is enabled
    ]
});

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.MessageCreate, message => {
    console.log(`Message received: ${message.content}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    await handleInteraction(interaction)
})

client.login(TOKEN).then(r => {
    console.log(`bot started`);
});