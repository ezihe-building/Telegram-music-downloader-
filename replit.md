# YouTube Telegram Music Bot

A Telegram bot that searches YouTube for songs, remixes, funk, phonk, and other music, then sends the selected result as an audio file.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secret: `TELEGRAM_BOT_TOKEN`
- Required secret: `AUDD_API_TOKEN` for identifying songs from uploaded clips
- Required system tools: `yt-dlp`, `ffmpeg`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/lib/bot.ts` — Telegram commands, callbacks, playlists, and user-facing messages
- `artifacts/api-server/src/lib/telegram.ts` — small Telegram Bot API client, including audio uploads
- `artifacts/api-server/src/lib/youtube.ts` — YouTube search and audio download via `yt-dlp`
- `artifacts/api-server/src/lib/recognition.ts` — `ffmpeg` clip extraction and AudD song recognition
- `artifacts/api-server/src/index.ts` — starts the HTTP health server and Telegram long-polling worker

## Architecture decisions

- YouTube is accessed through the installed `yt-dlp` command rather than a YouTube API key, so song-name matching works without an active external API credential.
- Telegram long polling is used instead of a webhook so the bot works immediately in development and does not require a public callback URL.
- Search results and playlists are kept in memory for the first build; a restart clears them.

## Product

- `/start` and `/help` show the welcome screen and example searches.
- Any plain text, `/search <query>`, or `/play <query>` searches YouTube.
- Users can select a result, download it as MP3, open a lyrics search, save the track, view `/playlist`, and request more matches.
- The experience uses compact inline buttons and track labels modeled on the supplied Telegram screenshots.

## User preferences

- The user wants broad matching for funk and all song types through YouTube search.

## Gotchas

- Telegram audio delivery is limited by Telegram’s upload size; downloads are capped below 48 MB.
- Some YouTube videos may reject extraction or have no downloadable audio; the bot reports that case and keeps the search results available.
- Telegram bot file downloads are capped at 20 MB, and AudD recognition uses a 12-second sample from the uploaded media.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
