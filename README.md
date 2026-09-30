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

This project includes a Render Blueprint and Dockerfile. The container installs
the required `ffmpeg` and `yt-dlp` tools, builds the bot, and runs the Telegram
long-polling worker as a web service. Render checks `/api/healthz` to confirm
that the service is running.

### One-click deployment

1. Make sure you have these two values ready:
   - `TELEGRAM_BOT_TOKEN`: create or copy it from [BotFather](https://t.me/BotFather).
   - `AUDD_API_TOKEN`: copy it from your AudD account. This enables recognition
     from uploaded audio, video, and voice clips.
2. Click the button below:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ezihe-building/Telegram-music-downloader-)

3. Sign in to Render and confirm the GitHub repository:
   `ezihe-building/Telegram-music-downloader-`.
4. Review the service name and region, then continue to create the Blueprint.
5. Enter the values in Render's secure environment-variable form:
   - `TELEGRAM_BOT_TOKEN`
   - `AUDD_API_TOKEN`
6. Accept Render's terms and click **Apply** or **Create Web Service**.
7. Wait for the Docker build and health check to finish. The service is ready
   when Render reports that `/api/healthz` is healthy.
8. Open Telegram, find your bot, and send `/start`. Then send a song title to
   confirm that search and audio delivery work.

The secrets are intentionally marked `sync: false` in `render.yaml`. Render
prompts for them during setup, but their values must not be committed to GitHub
or placed in this README.

### Updating the deployed bot

The Blueprint uses `autoDeploy: false`, so a new GitHub push does not
automatically restart the Render service. After pushing an update:

1. Open the service in the Render dashboard.
2. Select **Manual Deploy**.
3. Choose **Deploy latest commit**.
4. Wait for the health check, then test the bot in Telegram.

### Render notes

- This bot uses Telegram long polling, so it needs a running web service rather
  than a static site or scheduled job.
- The Blueprint defaults to Render's free plan. Check Render's current free-plan
  limits before relying on the bot for uninterrupted availability; upgrade the
  service if it sleeps or you need always-on operation.

The Docker image includes these system tools:

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