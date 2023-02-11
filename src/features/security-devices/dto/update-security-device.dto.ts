import { PartialType } from '@nestjs/mapped-types';
import { CreateSecurityDeviceDto } from './create-security-device.dto';

export class UpdateSecurityDeviceDto extends PartialType(
  CreateSecurityDeviceDto,
) {}
