import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

export type RecognitionResult = {
  artist: string;
  title: string;
  album?: string;
  timecode?: string;
  songLink?: string;
};

type AuddResponse = {
  status?: string;
  error?: { error_code?: number; error_message?: string };
  result?: {
    artist?: string;
    title?: string;
    album?: string;
    timecode?: string;
    song_link?: string;
  } | null;
};

function runProcess(command: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    const timeout = setTimeout(() => {
      process.kill("SIGKILL");
      reject(new Error(`${command} timed out.`));
    }, timeoutMs);

    process.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    process.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    process.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(stderr.trim() || `${command} exited with code ${code ?? "unknown"}`));
        return;
      }
      resolve();
    });
  });
}

async function createAudioSample(inputPath: string, directory: string): Promise<string> {
  const outputPath = join(directory, "recognition-sample.mp3");
  await runProcess(
    "ffmpeg",
    [
      "-y",
      "-i",
      inputPath,
      "-t",
      "12",
      "-vn",
      "-ac",
      "1",
      "-ar",
      "44100",
      "-b:a",
      "128k",
      outputPath,
    ],
    90_000,
  );
  return outputPath;
}

export async function recognizeAudioFile(inputPath: string): Promise<RecognitionResult | null> {
  const token = process.env["AUDD_API_TOKEN"];
  if (!token) throw new Error("AUDD_API_TOKEN is required for clip recognition.");

  const directory = await mkdtemp(join(tmpdir(), "telegram-recognition-"));
  try {
    const samplePath = await createAudioSample(inputPath, directory);
    const sample = await readFile(samplePath);
    const form = new FormData();
    form.append("api_token", token);
    form.append("return", "apple_music,spotify");
    form.append("file", new Blob([sample], { type: "audio/mpeg" }), "clip.mp3");

    const response = await fetch("https://api.audd.io/", {
      method: "POST",
      body: form,
    });
    const data = (await response.json()) as AuddResponse;
    if (!response.ok) {
      throw new Error(`AudD request failed: ${response.status} ${response.statusText}`);
    }
    if (data.error) {
      throw new Error(data.error.error_message ?? "AudD could not recognize the clip.");
    }
    if (!data.result?.artist || !data.result.title) return null;

    return {
      artist: data.result.artist,
      title: data.result.title,
      album: data.result.album,
      timecode: data.result.timecode,
      songLink: data.result.song_link,
    };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}