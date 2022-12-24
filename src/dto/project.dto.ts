import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsEmail, ValidateIf, IsString } from 'class-validator';

export class ProjectCreateDto {
  @IsString()
  nameTH: string;

  @IsString()
  nameEN: string;

  @ValidateIf((o) => o.description != null)
  @IsString()
  description: string | null;

  @IsEmail({}, { each: true })
  partners: string[];

  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  advisors: string[];
}
