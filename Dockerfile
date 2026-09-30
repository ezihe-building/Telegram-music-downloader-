FROM node:24-bookworm-slim

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates ffmpeg python3 python3-pip \
  && pip3 install --no-cache-dir --break-system-packages yt-dlp \
  && npm install --global pnpm@10.26.1 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile \
  && pnpm --filter @workspace/api-server run build \
  && pnpm store prune

EXPOSE 10000

CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]