export const jwtIncorrect = {
  message: 'Invalid or expired JWT refreshToken in headers.authorization.',
  field: 'headers.authorization',
};
export const jwtCookiesIncorrect = {
  message: 'Invalid or expired JWT refreshToken in request.cookies.',
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
export const userAlreadyExists = {
  message: 'User already exists. Invalid login or email.',
  field: 'loginOrEmail',
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
export const emailNotExistsOrIsConfirmed = {
  message: 'The email does not exist or the user is already confirmed.',
  field: 'email',
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
