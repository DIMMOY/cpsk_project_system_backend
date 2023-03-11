import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsNumberString,
  ValidateIf,
} from 'class-validator';

export class ProjectHasAssessmentCreateDto {
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  form: Array<number>;

  @IsNumberString({
    message: 'Value must be a valid number',
  })
  sumScore: number;

  @IsNumber()
  rawScore: number;

  @ValidateIf((o) => o.feedBack != null)
  @IsString()
  feedBack: string | null;
}
