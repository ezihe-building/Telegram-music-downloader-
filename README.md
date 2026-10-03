# Ezihe Music Bot

A Telegram music bot with a small public website. The same Node.js service
serves the landing page, Telegram health endpoint, and the long-running bot.

## What it does

- Search YouTube by song, artist, genre, or mood.
- Identify songs from short audio, video, and voice clips.
- Send available audio matches to Telegram, with lyrics links and a chat
  playlist.
- Serve a responsive bot website at `/` and a health check at
  `/api/healthz`.

## Publish on Replit

This bot uses Telegram long polling, so publish it as a **Reserved VM** to keep
the bot process running continuously. The project's `.replit` configuration
selects Replit's always-on VM deployment target.

1. Confirm `TELEGRAM_BOT_TOKEN` and `AUDD_API_TOKEN` exist in Replit Secrets.
   `AUDD_API_TOKEN` enables clip recognition.
2. Click **Publish** and review the Reserved VM settings and pricing.
3. After publishing, open the public URL for the website and visit
   `https://t.me/Phicodm_bot` to try the bot.
4. The service health endpoint is `/api/healthz`.

The development preview serves the website without polling Telegram. The
published service enables polling, avoiding two copies of the bot competing for
the same Telegram updates. The `.replit` configuration includes `yt-dlp` and
`ffmpeg`, which the bot uses for search, audio downloads, and clip processing.

## Local development

```sh
pnpm --filter @workspace/api-server run dev
```

To run the bot locally as well as the website, set `RUN_TELEGRAM_BOT=true` in
the development environment. Only one process should poll Telegram with a bot
token at a time.

Typecheck the API server with:

```sh
pnpm --filter @workspace/api-server run typecheck
```

The bot uses YouTube search and audio-download tooling for publicly accessible
videos; it does not bypass private, paid, or otherwise access-restricted
content. Source availability can vary.