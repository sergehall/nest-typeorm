import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiHeader } from '@nestjs/swagger';

type ApiProviderWebhookOptions = {
  readonly provider: string;
  readonly signatureHeader?: string;
};

export function ApiProviderWebhook(options: ApiProviderWebhookOptions): MethodDecorator {
  const decorators: MethodDecorator[] = [
    ApiConsumes('application/json'),
    ApiBody({
      description: `Raw ${options.provider} webhook event. The payload is validated by the provider integration before business processing.`,
      schema: {
        type: 'object',
        additionalProperties: true,
      },
    }),
  ];

  if (options.signatureHeader) {
    decorators.push(
      ApiHeader({
        name: options.signatureHeader,
        description: `${options.provider} webhook signature used to verify payload authenticity.`,
        required: true,
      }),
    );
  }

  return applyDecorators(...decorators);
}
