import ytdl, { videoInfo } from "@distube/ytdl-core";
import fs from "node:fs";
import path from "node:path";
import { AudioFile } from "../types";


const cachedAudio: Map<string, AudioFile> = new Map();

export const downloadAudioFromUrl = async (url: string): Promise<AudioFile> => {

    if (cachedAudio.has(url)) {
        const existingAudio = cachedAudio.get(url);
        if (existingAudio && fs.existsSync(existingAudio.path)) {
            return existingAudio;
        }
    }

    const videoInfo: videoInfo = await ytdl.getInfo(url);
    const title = videoInfo.videoDetails.title.replace(/[<>:"/\\|?*]+/g, '');

    const audiosDir = path.resolve(__dirname, '..', 'audios');
    if (!fs.existsSync(audiosDir)) {
        fs.mkdirSync(audiosDir, { recursive: true });
    }

    const audioFilePath = path.resolve(audiosDir, `${title}.mp3`);

    await new Promise<void>((resolve, reject) => {
        ytdl(url, { quality: 'highestaudio' })
            .pipe(fs.createWriteStream(audioFilePath))
            .on('finish', () => {
                resolve();
            })
            .on('error', (error: Error) => {
                reject(error);
            });
    });

    const audioFile: AudioFile = {
        path: audioFilePath,
        title: title,
        url: url,
        timestamp: Date.now(),
    }
    cachedAudio.set(url, audioFile);
    return audioFile;
}