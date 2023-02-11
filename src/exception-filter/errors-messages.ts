export const jwtIncorrect = {
  message:
    'JWT refreshToken inside headers.authorization is missing, expired or incorrect',
  field: 'headers.authorization',
};
export const jwtCookiesIncorrect = {
  message:
    'JWT refreshToken inside request.cookies is missing, expired or incorrect',
  field: 'request.cookies',
};
export const codeIncorrect = {
  message: 'Confirmation code is incorrect, expired or already been applied',
  field: 'code',
};
export const loginOrPassInvalid = {
  message: 'Login or password invalid',
  field: 'Login or password in auth headers',
};
export const moAnyAuthHeaders = {
  message: 'No any auth headers',
  field: 'headers.authorization',
};
export const userAlreadyExists = {
  message: 'Login or password invalid',
  field: 'headers.authorization',
};
export const loginOrEmailInvalid = {
  message: 'Unsuitable loginOrEmail min 3 max 20',
  field: 'loginOrEmail',
};
export const passwordInvalid = {
  message: 'Unsuitable password min 6 max 20',
  field: 'password',
};
export const validatePasswordFailed = {
  message: 'Login or password invalid',
  field: 'loginOrEmail or password in auth headers',
};
export const userNotExists = {
  message: 'User does not exist',
  field: 'email',
};
