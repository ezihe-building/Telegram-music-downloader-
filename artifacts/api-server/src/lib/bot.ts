import { logger } from "./logger";
import {
  InlineKeyboardButton,
  TelegramClient,
  type TelegramCallbackQuery,
  type TelegramMessage,
  type TelegramUpdate,
} from "./telegram";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { recognizeAudioFile, type RecognitionResult } from "./recognition";
import { cleanupAudio, downloadAudio, searchYoutube, type YoutubeTrack } from "./youtube";

const MAX_QUERY_LENGTH = 120;
const ANIME_ASSET_DIR = join(dirname(fileURLToPath(import.meta.url)), "../assets/anime");
const ANIME_ASSETS = ["anime-01.png", "anime-02.png", "anime-03.png", "anime-04.png"];
const tracksByChat = new Map<number, YoutubeTrack[]>();
const queryByChat = new Map<number, string>();
const playlistsByChat = new Map<number, YoutubeTrack[]>();
let nextAnimeAsset = 0;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function trackLabel(track: YoutubeTrack): string {
  const duration = formatDuration(track.durationSeconds);
  const label = `${duration ? `${duration} · ` : ""}${track.title} — ${track.channel}`;
  return Array.from(label).slice(0, 60).join("");
}

function resultKeyboard(
  tracks: YoutubeTrack[],
  showMore: boolean,
  indexOffset = 0,
): { inline_keyboard: InlineKeyboardButton[][] } {
  const rows = tracks.map((track, index) => [
    { text: trackLabel(track), callback_data: `track:${index + indexOffset}` },
  ]);
  if (showMore) {
    rows.push([{ text: "＋ More tracks", callback_data: "more" }]);
  }
  return { inline_keyboard: rows };
}

function lyricsKeyboard(track: YoutubeTrack): { inline_keyboard: InlineKeyboardButton[][] } {
  const lyricsUrl = `https://www.google.com/search?q=${encodeURIComponent(`${track.title} ${track.channel} lyrics`)}`;
  return {
    inline_keyboard: [
      [
        { text: "▣ Lyrics", url: lyricsUrl },
        { text: "＋ Save to playlist", callback_data: `save:${track.id}` },
      ],
    ],
  };
}

function cleanQuery(text: string): string {
  return text.replace(/^\/(?:search|play)\s*/i, "").trim().slice(0, MAX_QUERY_LENGTH);
}

async function sendCharacterImage(
  client: TelegramClient,
  chatId: number,
  caption: string,
): Promise<void> {
  const assetName = ANIME_ASSETS[nextAnimeAsset % ANIME_ASSETS.length];
  nextAnimeAsset += 1;
  try {
    await client.sendPhoto({
      chatId,
      photoPath: join(ANIME_ASSET_DIR, assetName),
      caption,
    });
  } catch (error) {
    logger.warn({ err: error, chatId, assetName }, "Character image could not be sent");
  }
}

async function sendWelcome(client: TelegramClient, message: TelegramMessage): Promise<void> {
  const firstName = message.from?.first_name ?? "there";
  await sendCharacterImage(
    client,
    message.chat.id,
    "<b>Olivia is online ✨</b>\nYour premium music scout is ready.",
  );
  await client.sendMessage(
    message.chat.id,
    [
      `<b>Welcome, ${escapeHtml(firstName)} ✨</b>`,
      "",
      "I’m Olivia — your premium music scout. Send me a song, artist, funk, remix, or even a mood, and I’ll hunt down a YouTube match.",
      "Got a mystery tune? Send a short video, voice note, or audio clip and I’ll try to recognize it.",
      "",
      "<b>Try a vibe:</b>",
      "• Manýa 🌙",
      "• Brazilian phonk 🔥",
      "• Wizkid latest 🎶",
      "",
      "<i>Pick a result and I’ll serve the audio file. Keep the good vibes coming.</i>",
      "",
      "Thanks for using <b>Ezihe Premium Bot</b> — come back anytime.",
    ].join("\n"),
    {
      inline_keyboard: [
        [{ text: "🎵 Search a song", callback_data: "prompt_search" }],
        [{ text: "💾 My playlist", callback_data: "playlist" }],
      ],
    },
  );
}

async function performSearch(client: TelegramClient, chatId: number, query: string): Promise<void> {
  if (!query) {
    await client.sendMessage(chatId, "Tell me what you want to hear 🎧\n\nSend a song title, artist, funk, remix, genre, or just describe the mood.");
    return;
  }

  await client.sendChatAction(chatId, "typing");
  let tracks: YoutubeTrack[];
  try {
    tracks = await searchYoutube(query, 8);
  } catch (error) {
    logger.error({ err: error, chatId, query }, "YouTube search failed");
    await client.sendMessage(chatId, "My music radar hit a small pause 🛰️\nYouTube search is temporarily unavailable. Please try again in a moment.");
    return;
  }

  tracksByChat.set(chatId, tracks);
  queryByChat.set(chatId, query);
  if (!tracks.length) {
    await client.sendMessage(chatId, `I couldn’t find a match for <b>${escapeHtml(query)}</b> 🥲\n\nTry the artist name, a shorter title, or tell me the mood and I’ll search again.`);
    return;
  }

  try {
    await sendCharacterImage(
      client,
      chatId,
      `<b>Vibe check complete 🎶</b>\nI found a few matches for <i>${escapeHtml(query)}</i>.\n\nIs this what you were looking for?`,
    );
    await client.sendMessage(
      chatId,
      `<b>${escapeHtml(query)}</b>\n\nI found these from YouTube. Pick one and I’ll get the audio ready for you ✨`,
      resultKeyboard(tracks, true),
    );
  } catch (error) {
    logger.error({ err: error, chatId, query }, "Telegram could not send YouTube results");
    await client.sendMessage(chatId, "I found the tracks, but couldn’t display them just now 😅\nPlease try the search again.");
  }
}

async function sendPlaylist(client: TelegramClient, chatId: number): Promise<void> {
  const playlist = playlistsByChat.get(chatId) ?? [];
  if (!playlist.length) {
    await client.sendMessage(chatId, "Your playlist is still waiting for its first favourite 🎶\nPick a track and tap “＋ Save to playlist” to keep it close.");
    return;
  }
  await client.sendMessage(
    chatId,
    `<b>💾 Your playlist</b>\n\n${playlist.map((track, index) => `${index + 1}. ${escapeHtml(track.title)} — ${escapeHtml(track.channel)}`).join("\n")}\n\n<i>Your personal queue of good decisions.</i>`,
  );
}

async function sendDownloadedTrack(client: TelegramClient, chatId: number, track: YoutubeTrack): Promise<void> {
  const download = await downloadAudio(track);
  try {
    await client.sendAudio({
      chatId,
      audioPath: download.audioPath,
      title: track.title,
      performer: track.channel,
      duration: track.durationSeconds,
      caption: `<b>🎧 ${escapeHtml(track.title)}</b>\n${escapeHtml(track.channel)}\n\n<i>Enjoy the sound — and tell me if I got the vibe right.</i>\n\nSource: YouTube · Ezihe Premium Bot`,
      replyMarkup: lyricsKeyboard(track),
    });
  } finally {
    await cleanupAudio(download.directory);
  }
}

function mediaFileId(message: TelegramMessage): { fileId: string; fileSize?: number } | null {
  const media = message.video ?? message.audio ?? message.voice ?? message.document;
  if (!media) return null;
  return { fileId: media.file_id, fileSize: media.file_size };
}

async function recognizeClip(client: TelegramClient, message: TelegramMessage): Promise<void> {
  const media = mediaFileId(message);
  if (!media) return;
  const chatId = message.chat.id;
  if (media.fileSize && media.fileSize > 20 * 1024 * 1024) {
    await client.sendMessage(chatId, "That clip is a little too big for Telegram’s bot limit 📦\nSend a shorter or compressed file under 20 MB and I’ll listen.");
    return;
  }

  const directory = await mkdtemp(join(tmpdir(), "telegram-clip-"));
  const inputPath = join(directory, "incoming-media");
  try {
    await client.sendChatAction(chatId, "typing");
    await client.sendMessage(chatId, "🎙️ I’m listening closely and checking the song fingerprint…\nGive me a moment, music detective mode is on.");
    await client.downloadFile(media.fileId, inputPath);
    const match: RecognitionResult | null = await recognizeAudioFile(inputPath);
    if (!match) {
      await client.sendMessage(chatId, "I couldn’t identify that clip this time 🥲\nTry a clear 8–12 second section with less talking or background noise.");
      return;
    }

    const query = `${match.artist} ${match.title}`.slice(0, MAX_QUERY_LENGTH);
    await client.sendMessage(
      chatId,
      `<b>🎶 I heard:</b> ${escapeHtml(match.title)}\n<b>Artist:</b> ${escapeHtml(match.artist)}\n\nThat one has a personality. Finding the best YouTube audio now…`,
    );
    const tracks = await searchYoutube(query, 8);
    tracksByChat.set(chatId, tracks);
    queryByChat.set(chatId, query);
    if (!tracks.length) {
      await client.sendMessage(chatId, "I identified the song, but couldn’t find a downloadable YouTube match for it 😕\nTry sending the title as text and I’ll search again.");
      return;
    }

    await client.sendChatAction(chatId, "upload_audio");
    try {
      await sendDownloadedTrack(client, chatId, tracks[0]);
    } catch (error) {
      logger.error({ err: error, chatId, trackId: tracks[0].id }, "Recognized audio download failed");
      await client.sendMessage(chatId, "I identified the song, but YouTube blocked the first match 😅\nUse the title above to search again or try another result.");
    }
  } catch (error) {
    logger.error({ err: error, chatId }, "Clip recognition failed");
    await client.sendMessage(chatId, "I couldn’t analyze that clip 😕\nSend a short MP4, MP3, voice note, or audio file and I’ll try again.");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function handleTrack(client: TelegramClient, callback: TelegramCallbackQuery, index: number): Promise<void> {
  const chatId = callback.message?.chat.id;
  if (!chatId) return;
  const track = tracksByChat.get(chatId)?.[index];
  if (!track) {
    await client.answerCallbackQuery(callback.id, "That result has expired. Search again 🔄");
    return;
  }
  await client.answerCallbackQuery(callback.id, "Preparing your audio 🎧");
  await client.sendChatAction(chatId, "upload_audio");

  try {
    await sendDownloadedTrack(client, chatId, track);
  } catch (error) {
    logger.error({ err: error, chatId, trackId: track.id }, "Audio download failed");
    await client.sendMessage(
      chatId,
      "I found the track, but YouTube did not allow this audio to be downloaded 😕\nTry another result or a different spelling.",
    );
  }
}

async function handleCallback(client: TelegramClient, callback: TelegramCallbackQuery): Promise<void> {
  const chatId = callback.message?.chat.id;
  if (!chatId) return;
  const data = callback.data ?? "";

  if (data === "prompt_search") {
    await client.answerCallbackQuery(callback.id);
    await client.sendMessage(chatId, "Your turn 🎤\nType the song, artist, funk, remix, genre, or mood you want to hear.");
    return;
  }
  if (data === "playlist") {
    await client.answerCallbackQuery(callback.id);
    await sendPlaylist(client, chatId);
    return;
  }
  if (data === "more") {
    await client.answerCallbackQuery(callback.id, "Finding more options 🎶");
    const current = tracksByChat.get(chatId) ?? [];
    const queryHint = queryByChat.get(chatId) ?? "";
    const extra = queryHint ? await searchYoutube(queryHint, 12) : [];
    const merged = [...current, ...extra.filter((track) => !current.some((item) => item.id === track.id))].slice(0, 16);
    tracksByChat.set(chatId, merged);
    await client.sendMessage(chatId, "A few more possibilities for your queue ✨", resultKeyboard(merged.slice(current.length), false, current.length));
    return;
  }
  if (data.startsWith("save:")) {
    const trackId = data.slice("save:".length);
    const track = tracksByChat.get(chatId)?.find((item) => item.id === trackId);
    if (!track) {
      await client.answerCallbackQuery(callback.id, "Search for a song first 🎵");
      return;
    }
    const playlist = playlistsByChat.get(chatId) ?? [];
    if (!playlist.some((item) => item.id === track.id)) playlist.push(track);
    playlistsByChat.set(chatId, playlist);
    await client.answerCallbackQuery(callback.id, "Saved to your playlist 💾");
    return;
  }
  if (data.startsWith("track:")) {
    const index = Number(data.slice("track:".length));
    if (Number.isInteger(index)) await handleTrack(client, callback, index);
  }
}

async function handleMessage(client: TelegramClient, message: TelegramMessage): Promise<void> {
  if (mediaFileId(message)) {
    await recognizeClip(client, message);
    return;
  }
  const text = message.text?.trim();
  if (!text) return;
  if (text === "/start" || text === "/help") {
    await sendWelcome(client, message);
    return;
  }
  if (text === "/playlist") {
    await sendPlaylist(client, message.chat.id);
    return;
  }
  await performSearch(client, message.chat.id, cleanQuery(text));
}

async function handleUpdate(client: TelegramClient, update: TelegramUpdate): Promise<void> {
  if (update.callback_query) {
    await handleCallback(client, update.callback_query);
    return;
  }
  if (update.message) await handleMessage(client, update.message);
}

export async function startTelegramBot(): Promise<void> {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required to start the Telegram bot.");

  const client = new TelegramClient(token);
  const me = await client.getMe();
  logger.info({ username: me.username }, "Telegram music bot connected");

  let offset = 0;
  const poll = async (): Promise<void> => {
    while (true) {
      try {
        const updates = await client.getUpdates(offset);
        for (const update of updates) {
          offset = update.update_id + 1;
          try {
            await handleUpdate(client, update);
          } catch (error) {
            logger.error({ err: error, updateId: update.update_id }, "Telegram update failed");
          }
        }
      } catch (error) {
        logger.error({ err: error }, "Telegram polling failed");
        await new Promise((resolve) => setTimeout(resolve, 5_000));
      }
    }
  };

  void poll();
}