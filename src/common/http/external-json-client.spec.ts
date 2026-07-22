import { ExternalHttpError, isRecord, requestExternalJson } from './external-json-client';

type TestResponse = {
  readonly value: string;
};

const isTestResponse = (value: unknown): value is TestResponse =>
  isRecord(value) && typeof value.value === 'string';

describe('requestExternalJson', () => {
  const request = () =>
    requestExternalJson({
      provider: 'Test API',
      url: 'https://example.test/resource',
      init: { method: 'POST' },
      timeoutMs: 250,
      validate: isTestResponse,
    });

  it('returns a validated JSON response and configures a timeout signal', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ value: 'accepted' }), { status: 200 }));

    await expect(request()).resolves.toEqual({ value: 'accepted' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/resource',
      expect.objectContaining({
        method: 'POST',
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('preserves a network error as the cause', async () => {
    const networkError = new TypeError('socket disconnected');
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(networkError);

    await expect(request()).rejects.toMatchObject({
      name: 'ExternalHttpError',
      message: 'Test API request failed',
      cause: networkError,
    });
  });

  it('rejects HTTP errors and retains the text response', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('upstream unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      }),
    );

    await expect(request()).rejects.toMatchObject({
      name: 'ExternalHttpError',
      message: 'Test API request failed with HTTP 503',
      status: 503,
      responseBody: 'upstream unavailable',
      cause: expect.any(Error),
    });
  });

  it('preserves the JSON parsing error as the cause', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{not-json', { status: 200 }));

    try {
      await request();
      fail('Expected the request to reject');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ExternalHttpError);
      if (!(error instanceof ExternalHttpError)) return;

      expect(error.message).toBe('Test API returned invalid JSON');
      expect(error.cause).toMatchObject({ name: 'SyntaxError' });
    }
  });

  it('rejects valid JSON that does not match the expected schema', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ value: 42 }), { status: 200 }));

    await expect(request()).rejects.toMatchObject({
      name: 'ExternalHttpError',
      message: 'Test API returned an invalid response payload',
      cause: expect.any(TypeError),
    });
  });
});
