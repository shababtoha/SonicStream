import {ChatInputCommandInteraction, GuildMember} from "discord.js";
import fs from "node:fs";
import {
    AudioPlayer,
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
    VoiceConnection
} from "@discordjs/voice";
import { downloadAudioFromUrl } from "./downloader";
import {AudioFile, AudioPlayerState} from "../types";
import play from 'play-dl';


const botPlayerStates: Map<string, AudioPlayerState> = new Map();

const playAudio = async (interaction: ChatInputCommandInteraction, audioFile: AudioFile): Promise<void> => {
    const voiceChannel = (interaction.member as GuildMember)?.voice.channel;
    if(!voiceChannel) {
        await interaction.editReply({ content: "❌ Please join a voice channel first!"});
        return;
    }
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.editReply({ content: "❌ Unable to determine the server." });
        return;
    }
    const channelId = voiceChannel.id;

    if(botPlayerStates.has(guildId)) {
        const isPlaying = botPlayerStates.get(guildId)?.status === 'playing';
        const requestMember = botPlayerStates.get(guildId)?.requestMember;
        const existingChannelId = botPlayerStates.get(guildId)?.channelId;

        if(!isPlaying || (interaction.member == requestMember) || (existingChannelId !== channelId)) {
            const existingPlayer = botPlayerStates.get(guildId)?.player;
            if (existingPlayer) {
                existingPlayer.stop(); // Stop the existing player
            }
            botPlayerStates.delete(guildId);
        } else {
            await interaction.editReply({ content: `❌ Already playing something in in <#${channelId}>` });
            return;
        }
    }


    const audioStream = fs.createReadStream(audioFile.path);
    const connection: VoiceConnection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId!,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    const player: AudioPlayer = createAudioPlayer();
    const resource = createAudioResource(audioStream, { inputType: StreamType.Arbitrary });
    player.play(resource);
    connection.subscribe(player);

    botPlayerStates.set(guildId, {
        status: 'playing',
        guildId: guildId,
        channelId: channelId,
        requestMember: interaction.member as GuildMember,
        player: player,
        voiceConnection: connection
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('Audio playback finished.');
        connection.destroy(); // Disconnect from the voice channel when done
        botPlayerStates.delete(guildId);
    })

    await interaction.editReply({ content: `🎶 Now playing: ${audioFile.title} in <#${channelId}>` });
}


export const downloadAndPlayAudio = async (interaction: ChatInputCommandInteraction, ytUrl: string): Promise<void> => {
    await interaction.editReply({ content: "⏳ Downloading Audio...." });
    const downloadedAudio = await downloadAudioFromUrl(ytUrl);
    if (!downloadedAudio) {
        await interaction.editReply({ content: "❌ Failed to download audio." });
        return;
    }
    await playAudio(interaction, downloadedAudio)
}

export const searchAndPlayAudio = async (interaction: ChatInputCommandInteraction, searchQuery: string): Promise<void> => {
    const searchResult = await play.search(searchQuery, {limit: 1});
    if (!searchResult.length) {
        await interaction.editReply("❌ No results found.");
        return;
    }
    const video = searchResult[0];
    await downloadAndPlayAudio(interaction, video.url);
}

export const stopAudioPlayback = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const guildId = interaction.guildId;
    if (!guildId || !botPlayerStates.has(guildId)) {
        await interaction.editReply({ content: "❌ No audio is currently playing." });
        return;
    }

    const voiceConnection = botPlayerStates.get(guildId)?.voiceConnection;
    if (voiceConnection) {
        voiceConnection.destroy()
        botPlayerStates.delete(guildId);
        await interaction.editReply({ content: "⏹️ Audio playback stopped." });
    } else {
        await interaction.editReply({ content: "❌ Failed to stop audio playback." });
    }
}