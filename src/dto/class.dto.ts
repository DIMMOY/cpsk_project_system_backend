import { PartialType } from '@nestjs/mapped-types';
import { ValidateIf, IsString, IsISO8601, IsIn } from 'class-validator';

export class ClassCreateDto {
  @IsString()
  name: string;

  @IsString()
  inviteCode: string;

  @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  endDate: Date | null;

  @IsIn([1, 2])
  status: number;

  @IsIn(['CPE', 'SKE'])
  major: string;
}

export class ClassUpdateDto extends PartialType(ClassCreateDto) {}
