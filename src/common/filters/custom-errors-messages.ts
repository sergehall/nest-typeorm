export const jwtIncorrect = {
  message: 'Invalid or expired JWT.',
  field: 'headers.authorization',
};

export const notFoundHeader = {
  message: 'Authorization header not found in the request.',
  field: 'client.request.headers.authorization',
};

export const jwtCookiesIncorrect = {
  message: 'Invalid, expired or must be provided jwt in cookies.',
  field: 'request.cookies',
};
export const codeIncorrect = {
  message: 'Incorrect, expired, or already used confirmation code.',
  field: 'code',
};
export const loginOrPassInvalid = {
  message: 'Invalid login or password.',
  field: 'headers.authorization',
};
export const noAuthHeadersError = {
  message: 'No authentication headers found.',
  field: 'headers.authorization',
};
export const loginOrEmailAlreadyExists = {
  message: 'Login or Email already exists.',
  field: 'field',
};
export const invalidLoginOrEmailLengthError = {
  message:
    'Invalid login or email length. Must be between 3 and 20 characters.',
  field: 'loginOrEmail',
};
export const passwordInvalid = {
  message: 'Invalid password length. Must be between 6 and 20 characters.',
  field: 'password',
};
export const validatePasswordFailed = {
  message: 'Invalid login or password',
  field: 'headers.authorization or password',
};
export const userNotHavePermission = {
  message: 'You do not have permission. The blog does not belong to you.',
  params: 'blogId',
};
export const userNotHavePermissionForBlog = {
  message:
    'Leaving comments for this user is not allowed, and accessing the blog is restricted.',
  params: 'blogId',
};
export const userNotHavePermissionForPost = {
  message:
    'Leaving posts for this user is not allowed, and accessing the blog is restricted.',
  params: 'blogId',
};
export const userNotHavePermissionSubscribeForBlog = {
  message:
    'Subscribe for blog for this user is not allowed, and accessing the blog is restricted.',
  params: 'blogId',
};
export const cannotBlockOwnBlog = {
  message: 'You cannot block your own blog.',
  field: 'id',
};
export const cannotBlockYourself = {
  message: 'You cannot block yourself.',
  field: 'id',
};
export const forbiddenDeleteDevice = {
  message: 'Cannot delete a device that does not belong to the current user.',
  params: 'deviceId',
};
export const noOpenGameMessage = {
  message: 'The user has no open, active games.',
  useCase: 'AnswerForCurrentQuestionUseCase',
};
export const answeredAllQuestionsMessage = {
  message: 'The user has already answered all of the questions.',
  useCase: 'AnswerForCurrentQuestionUseCase',
};
export const theGameIsOver = {
  message: 'The opponent gave all the answer and 10 seconds passed.',
  useCase: 'AnswerForCurrentQuestionUseCase',
};
export const notFoundChallengeQuestions = {
  message: 'Challenge questions Not Found for the Current Game.',
  useCase: 'AnswerForCurrentQuestionUseCase',
};
export const idFormatError = {
  message: `The ID provided in the parameters is in an incorrect format.`,
  params: 'id',
};
export const fileNotProvided = {
  message: 'File not provided',
  file: 'file',
};
export const fileSizeLimit = {
  message: 'File size exceeds the allowed limit. Max 100KB',
  file: 'file.size',
};

export const invalidImageDimensions = {
  message: 'Invalid dimensions maxWidth: 940 and maxHeight: 432',
  file: 'file.dimensions',
};
export const invalidFileExtension = {
  message: 'Invalid file extension. allowedExtensions are .png, .jpg, .jpeg',
  file: 'file.extension',
};
