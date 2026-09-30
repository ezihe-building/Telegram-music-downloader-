import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

export type YoutubeTrack = {
  id: string;
  title: string;
  channel: string;
  durationSeconds?: number;
  thumbnail?: string;
  url: string;
};

type YtDlpEntry = {
  id?: string;
  title?: string;
  channel?: string;
  uploader?: string;
  duration?: number;
  thumbnail?: string;
  webpage_url?: string;
  url?: string;
};

type YtDlpSearchResult = {
  entries?: YtDlpEntry[];
};

function runYtDlp(args: string[], timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      process.kill("SIGKILL");
      reject(new Error("YouTube request timed out."));
    }, timeoutMs);

    process.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
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
        reject(new Error(stderr.trim() || `yt-dlp exited with code ${code ?? "unknown"}`));
        return;
      }
      resolve(stdout);
    });
  });
}

function normalizeEntry(entry: YtDlpEntry): YoutubeTrack | null {
  if (!entry.id || !entry.title) return null;
  const returnedUrl = entry.webpage_url ?? entry.url;
  const url = returnedUrl?.startsWith("http")
    ? returnedUrl
    : `https://www.youtube.com/watch?v=${entry.id}`;
  return {
    id: entry.id,
    title: entry.title,
    channel: entry.channel ?? entry.uploader ?? "YouTube",
    durationSeconds: entry.duration,
    thumbnail: entry.thumbnail,
    url,
  };
}

export async function searchYoutube(query: string, limit = 8): Promise<YoutubeTrack[]> {
  const raw = await runYtDlp(
    [
      `ytsearch${limit}:${query}`,
      "--flat-playlist",
      "--dump-single-json",
      "--no-warnings",
      "--skip-download",
      "--ignore-errors",
    ],
    45_000,
  );
  const parsed = JSON.parse(raw) as YtDlpSearchResult;
  return (parsed.entries ?? [])
    .map(normalizeEntry)
    .filter((track): track is YoutubeTrack => track !== null);
}

export async function downloadAudio(track: YoutubeTrack): Promise<{
  directory: string;
  audioPath: string;
}> {
  const directory = await mkdtemp(join(tmpdir(), "telegram-music-"));
  try {
    await runYtDlp(
      [
        "--no-playlist",
        "--format",
        "bestaudio/best",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "--max-filesize",
        "48M",
        "--no-warnings",
        "--extractor-args",
        "youtube:player_client=android,formats=missing_pot",
        "--output",
        join(directory, "%(id)s.%(ext)s"),
        track.url,
      ],
      180_000,
    );
    const files = await readdir(directory);
    const audioFile = files.find((file) => file.toLowerCase().endsWith(".mp3"));
    if (!audioFile) throw new Error("YouTube did not return an audio file.");
    return { directory, audioPath: join(directory, audioFile) };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

export async function cleanupAudio(directory: string): Promise<void> {
  await rm(directory, { recursive: true, force: true });
}