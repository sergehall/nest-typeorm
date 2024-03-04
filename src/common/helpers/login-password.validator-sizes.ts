// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { CustomErrorsMessagesType } from '../filters/types/custom-errors-messages.types';
// import {
//   invalidLoginOrEmailLengthError,
//   passwordInvalid,
// } from '../filters/custom-errors-messages';
//
// @Injectable()
// export class LoginPasswordValidatorSizes {
//   async validate(loginOrEmail: string, password: string): Promise<void> {
//     const messages: CustomErrorsMessagesType[] = [];
//
//     this.validateLength(
//       loginOrEmail.toString(),
//       3,
//       50,
//       invalidLoginOrEmailLengthError,
//       messages,
//     );
//
//     this.validateLength(password.toString(), 6, 20, passwordInvalid, messages);
//
//     if (messages.length !== 0) {
//       throw new HttpException(
//         {
//           message: messages,
//         },
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }
//
//   private validateLength(
//     value: string,
//     min: number,
//     max: number,
//     errorMessage: CustomErrorsMessagesType,
//     messages: CustomErrorsMessagesType[],
//   ): void {
//     if (value.length < min || value.length > max) {
//       messages.push(errorMessage);
//     }
//   }
// }
