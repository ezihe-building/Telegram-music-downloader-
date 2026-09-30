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

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ezihe-building/Telegram-music-downloader-)

The repository includes a Render Blueprint and Dockerfile. The container installs
the required `ffmpeg` and `yt-dlp` tools, builds the bot, and runs the Telegram
long-polling worker as a web service with `/api/healthz` as its health check.

When the Deploy to Render button opens, Render asks for:

- `TELEGRAM_BOT_TOKEN` — create with BotFather.
- `AUDD_API_TOKEN` — required only for recognizing uploaded audio/video clips.

These values are intentionally marked `sync: false` in `render.yaml`. They must
be entered in Render's secure environment-variable form rather than committed
to GitHub, where anyone could read them.

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