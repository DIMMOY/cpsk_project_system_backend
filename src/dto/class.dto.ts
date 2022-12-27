import { PartialType } from '@nestjs/mapped-types';
import {
  ValidateIf,
  IsString,
  IsISO8601,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class ClassCreateDto {
  @IsString()
  name: string;

  inviteCode: string;

  @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  endDate: Date | null;

  @IsBoolean()
  complete: number;

  @IsIn(['CPE', 'SKE', 'ALL'])
  major: string;
}

export class ClassUpdateDto extends PartialType(ClassCreateDto) {}
