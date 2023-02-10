import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class FormCreateDto {
  @IsString()
  question: string;

  @IsString()
  description: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  limitScore: number;

  @IsNumber()
  type: number;
}

export class AssessmentCreateDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  score: number;

  @IsBoolean()
  feedBack: boolean;

  @IsNumber()
  assessBy: number;

  @IsArray()
  @Type(() => FormCreateDto)
  form: Array<FormCreateDto>;
}

export class AssessmentUpdateDto extends PartialType(AssessmentCreateDto) {}
