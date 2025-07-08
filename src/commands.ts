import { ApplicationCommandData } from 'discord.js';

export const commands: ApplicationCommandData[] = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'hello',
        description: 'World',
    },
    {
        name: 'song',
        description: 'play a song from youtube',
        options: [
            {
                name: 'url',
                type: 3, // STRING type
                description: 'youtube url',
                required: true,
            }
        ]
    },
    {
        name: 'search',
        description: 'Search a song by title from youtube',
        options: [
            {
                name: 'title',
                type: 3, // STRING type
                description: 'The title of the song to search for',
                required: true,
            }
        ]
    },
    {
        name: 'stop',
        description: 'Stop the audio playback and disconnect from the voice channel',
    }
];