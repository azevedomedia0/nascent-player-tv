/**
 * Pure validation for Waku publish requests — shared by the server
 * route and unit tests. Keeps the 64 KB / 200-char topic caps.
 */

export type WakuPublishBody = {
  payload?: unknown;
  contentTopic?: unknown;
  version?: unknown;
  timestamp?: unknown;
  ephemeral?: unknown;
  meta?: unknown;
};

export type WakuValidationOk = {
  ok: true;
  message: {
    payload: string;
    contentTopic: string;
    version: number;
    timestamp: number;
    ephemeral: boolean;
    meta?: string;
  };
};

export type WakuValidationErr = {
  ok: false;
  status: 400 | 413;
  error: string;
};

export function validateWakuPublish(
  contentTopicParam: string,
  body: WakuPublishBody | null | undefined
): WakuValidationOk | WakuValidationErr {
  if (!body || body.payload == null || body.payload === "") {
    return { ok: false, status: 400, error: "Invalid Waku message body: payload required" };
  }
  if (typeof body.payload !== "string" || body.payload.length > 65536) {
    return { ok: false, status: 413, error: "Waku payload exceeds the 64 KB limit" };
  }
  if (contentTopicParam.length > 200) {
    return { ok: false, status: 400, error: "contentTopic is too long" };
  }
  return {
    ok: true,
    message: {
      payload: body.payload,
      contentTopic:
        typeof body.contentTopic === "string" && body.contentTopic
          ? body.contentTopic
          : contentTopicParam,
      version: typeof body.version === "number" ? body.version : 0,
      timestamp: typeof body.timestamp === "number" ? body.timestamp : Date.now(),
      ephemeral: !!body.ephemeral,
      meta: typeof body.meta === "string" ? body.meta : undefined,
    },
  };
}
