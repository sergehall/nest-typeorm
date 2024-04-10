export const swaggerUtils = {
  badRequestResponse() {
    return badRequestResponse;
  },

  // Add any other utility functions related to Swagger here
};

const badRequestResponse = {
  description: 'If the inputModel has incorrect values',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          errorsMessages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                field: { type: 'string' },
              },
            },
          },
        },
      },
      example: {
        errorsMessages: [
          {
            message: 'Invalid value',
            field: 'fieldName',
          },
        ],
      },
    },
  },
};
