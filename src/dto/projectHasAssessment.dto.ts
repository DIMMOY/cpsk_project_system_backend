import { Transform, Type } from 'class-transformer';
import {
  ValidateIf,
  IsString,
  IsISO8601,
  IsIn,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

export class ProjectHasAssessmentCreateDto {
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  form: Array<number>;

  @IsNumber()
  sumScore: number;

  @IsNumber()
  rawScore: number;

  @IsString()
  feedBack: string | null;
}
