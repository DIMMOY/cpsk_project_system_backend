import { Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { ArrayNotEmpty, IsArray, IsEmail, ValidateIf } from 'class-validator';

export class ProjectCreateDto {
  @IsString()
  nameTH: string;

  @IsString()
  nameEN: string;

  @ValidateIf((o) => o.description != null)
  @IsString()
  description: string;

  @IsEmail({}, { each: true })
  partners: string[];

  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  advisors: string[];
}
