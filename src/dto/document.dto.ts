import { PartialType } from '@nestjs/mapped-types';
import { ValidateIf, IsString, IsISO8601, IsIn } from 'class-validator';

export class DocumentCreateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class DocumentUpdateDto extends PartialType(DocumentCreateDto) {}
