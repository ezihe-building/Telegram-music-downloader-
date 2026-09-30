import { readFile, writeFile } from "node:fs/promises";

const TELEGRAM_API_ROOT = "https://api.telegram.org";

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

export type TelegramChat = {
  id: number;
  type: string;
};

export type TelegramUser = {
  id: number;
  is_bot: boolean;
  first_name?: string;
  username?: string;
};

export type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
  caption?: string;
  audio?: TelegramAudio;
  document?: TelegramDocument;
  video?: TelegramVideo;
  voice?: TelegramVoice;
};

export type TelegramAudio = {
  file_id: string;
  duration?: number;
  file_size?: number;
  mime_type?: string;
  title?: string;
  performer?: string;
};

export type TelegramDocument = {
  file_id: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
};

export type TelegramVideo = {
  file_id: string;
  duration?: number;
  file_size?: number;
  mime_type?: string;
  width: number;
  height: number;
};

export type TelegramVoice = {
  file_id: string;
  duration?: number;
  file_size?: number;
  mime_type?: string;
};

type TelegramFile = {
  file_path?: string;
};

export type TelegramCallbackQuery = {
  id: string;
  from: TelegramUser;
  data?: string;
  message?: TelegramMessage;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

export type InlineKeyboardButton = {
  text: string;
  callback_data?: string;
  url?: string;
};

type SendAudioOptions = {
  chatId: number;
  audioPath: string;
  title: string;
  performer?: string;
  duration?: number;
  caption?: string;
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] };
};

type SendPhotoOptions = {
  chatId: number;
  photoPath: string;
  caption?: string;
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] };
};

function sanitizeTelegramString(value: string): string {
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        result += value[index] + value[index + 1];
        index += 1;
      } else {
        result += "\ufffd";
      }
      continue;
    }
    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      result += "\ufffd";
      continue;
    }
    if (
      (codeUnit < 0x20 && codeUnit !== 0x09 && codeUnit !== 0x0a && codeUnit !== 0x0d) ||
      (codeUnit >= 0x7f && codeUnit <= 0x9f)
    ) {
      result += " ";
      continue;
    }
    result += value[index];
  }
  return result;
}

function sanitizeTelegramPayload(value: unknown): unknown {
  if (typeof value === "string") return sanitizeTelegramString(value);
  if (Array.isArray(value)) return value.map(sanitizeTelegramPayload);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sanitizeTelegramPayload(nestedValue),
      ]),
    );
  }
  return value;
}

export class TelegramClient {
  private readonly baseUrl: string;

  constructor(private readonly token: string) {
    this.baseUrl = `${TELEGRAM_API_ROOT}/bot${token}`;
  }

  async getUpdates(offset: number, timeoutSeconds = 25): Promise<TelegramUpdate[]> {
    return this.call<TelegramUpdate[]>("getUpdates", {
      offset,
      timeout: timeoutSeconds,
      allowed_updates: ["message", "callback_query"],
    });
  }

  async getMe(): Promise<TelegramUser> {
    return this.call<TelegramUser>("getMe");
  }

  async downloadFile(fileId: string, destination: string): Promise<void> {
    const file = await this.call<TelegramFile>("getFile", { file_id: fileId });
    if (!file.file_path) throw new Error("Telegram did not return a downloadable file path.");
    const response = await fetch(`${TELEGRAM_API_ROOT}/file/bot${this.token}/${file.file_path}`);
    if (!response.ok) {
      throw new Error(`Telegram file download failed: ${response.status} ${response.statusText}`);
    }
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  }

  async sendMessage(
    chatId: number,
    text: string,
    replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] },
  ): Promise<TelegramMessage> {
    return this.call<TelegramMessage>("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    });
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
    return this.call<boolean>("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      ...(text ? { text } : {}),
    });
  }

  async sendChatAction(chatId: number, action: "typing" | "upload_audio"): Promise<boolean> {
    return this.call<boolean>("sendChatAction", {
      chat_id: chatId,
      action,
    });
  }

  async sendPhoto(options: SendPhotoOptions): Promise<TelegramMessage> {
    const photo = await readFile(options.photoPath);
    const form = new FormData();
    form.append("chat_id", String(options.chatId));
    form.append("photo", new Blob([photo], { type: "image/png" }), "ezihe-anime.png");
    if (options.caption) {
      form.append("caption", sanitizeTelegramString(options.caption));
      form.append("parse_mode", "HTML");
    }
    if (options.replyMarkup) {
      form.append("reply_markup", JSON.stringify(sanitizeTelegramPayload(options.replyMarkup)));
    }

    return this.callMultipart<TelegramMessage>("sendPhoto", form);
  }

  async sendAudio(options: SendAudioOptions): Promise<TelegramMessage> {
    const audio = await readFile(options.audioPath);
    const form = new FormData();
    form.append("chat_id", String(options.chatId));
    const title = sanitizeTelegramString(options.title);
    form.append("audio", new Blob([audio], { type: "audio/mpeg" }), `${title}.mp3`);
    form.append("title", title);
    if (options.performer) form.append("performer", sanitizeTelegramString(options.performer));
    if (options.duration) form.append("duration", String(options.duration));
    if (options.caption) form.append("caption", sanitizeTelegramString(options.caption));
    if (options.replyMarkup) {
      form.append("reply_markup", JSON.stringify(sanitizeTelegramPayload(options.replyMarkup)));
    }

    return this.callMultipart<TelegramMessage>("sendAudio", form);
  }

  private async call<T>(method: string, payload?: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sanitizeTelegramPayload(payload ?? {})),
    });
    const data = (await response.json()) as TelegramResponse<T>;
    if (!response.ok || !data.ok || data.result === undefined) {
      throw new Error(`Telegram ${method} failed: ${data.description ?? response.statusText}`);
    }
    return data.result;
  }

  private async callMultipart<T>(method: string, form: FormData): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: "POST",
      body: form,
    });
    const data = (await response.json()) as TelegramResponse<T>;
    if (!response.ok || !data.ok || data.result === undefined) {
      throw new Error(`Telegram ${method} failed: ${data.description ?? response.statusText}`);
    }
    return data.result;
  }
}