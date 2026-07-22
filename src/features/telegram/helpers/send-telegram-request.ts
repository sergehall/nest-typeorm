import { isRecord, requestExternalJson } from '../../../common/http/external-json-client';

type TelegramSuccessResponse = {
  readonly ok: true;
  readonly result: unknown;
};

function isTelegramSuccessResponse(value: unknown): value is TelegramSuccessResponse {
  return isRecord(value) && value.ok === true && 'result' in value;
}

export async function sendTelegramRequest(
  url: string,
  body: Readonly<Record<string, unknown>>,
): Promise<void> {
  await requestExternalJson({
    provider: 'Telegram API',
    url,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    validate: isTelegramSuccessResponse,
  });
}
