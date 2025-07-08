import { ChatInputCommandInteraction } from 'discord.js';
import {downloadAndPlayAudio, searchAndPlayAudio, stopAudioPlayback} from "./discordAudioPlayer";

const handleInteraction = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'ping':
            await interaction.reply('Pong!');
            break;
        case 'song':
            const url = interaction.options.getString('url');
            if (!url) {
                await interaction.reply({ content: 'Please provide a YouTube URL.', ephemeral: true });
                return;
            }
            await interaction.reply(`🔍Looking at **${url}**...`);

            try {
                await downloadAndPlayAudio(interaction, url);
            } catch (error) {
                console.error('Error downloading or playing audio:', error);
                await interaction.reply({ content: '❌ An error occurred while processing the audio.' });
            }
            break;
        case 'search':
            const title = interaction.options.getString('title');
            if (!title) {
                await interaction.reply({ content: 'Please provide a song title to search for.', ephemeral: true });
                return;
            }
            await interaction.reply(`🔍 Searching for **${title}**...`);
            try {
                await searchAndPlayAudio(interaction, title);
            } catch (error) {
                console.error('Error searching for audio:', error);
                await interaction.reply({ content: '❌ An error occurred while searching for the song.' });
            }
            break;
        case 'stop':
            // Assuming you have a function to stop the audio playback
            // This function should handle stopping the audio player and cleaning up resources
            await interaction.reply('Stopping the audio playback and disconnecting...');
            await stopAudioPlayback(interaction);
            break;
        default:
            await interaction.reply({ content: 'Unknown command' });
            break;
    }
}


export { handleInteraction };