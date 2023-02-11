import { PartialType } from '@nestjs/mapped-types';
import { CreateDemonDto } from './create-demon.dto';

export class UpdateDemonDto extends PartialType(CreateDemonDto) {}
