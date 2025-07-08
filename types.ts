import { GuildMember } from "discord.js";
import {AudioPlayer, VoiceConnection} from "@discordjs/voice";

export type AudioFile = {
    path: string;
    title: string;
    url: string;
    timestamp: number;
}

export type AudioPlayerState = {
    status: 'playing' | 'stopped';
    guildId: string;
    channelId: string;
    requestMember: GuildMember;
    player: AudioPlayer
    voiceConnection: VoiceConnection
}