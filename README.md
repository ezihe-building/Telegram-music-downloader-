# YouTube Telegram Music Bot

A Telegram bot that searches YouTube for songs and can identify a track from a
short uploaded audio or video clip.

## Features

- Search songs, artists, remixes, funk, phonk, and other music by text.
- Identify music from a Telegram video, voice note, audio file, or document.
- Return recognized songs as Telegram audio when a publicly available YouTube
  match can be downloaded.
- Save selected tracks to a simple in-memory playlist.
- Provide a lyrics search link for each delivered track.

## Run

This project uses the Replit pnpm workspace. The API server starts the Telegram
bot and exposes its health endpoint at `/api/healthz`.

Required secrets:

- `TELEGRAM_BOT_TOKEN` — create with BotFather.
- `AUDD_API_TOKEN` — for recognizing uploaded audio/video clips.

Required system tools:

- `yt-dlp`
- `ffmpeg`

Start the server with:

```sh
pnpm --filter @workspace/api-server run dev
```

Check TypeScript with:

```sh
pnpm --filter @workspace/api-server run typecheck
```

The bot uses YouTube search and download tooling for public videos. It does not
bypass private, paid, or otherwise access-restricted content. Some videos may
not be available for audio extraction.