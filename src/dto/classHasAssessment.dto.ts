import { PickType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsISO8601,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';
export class ClassHasAssessmentCreateDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  classId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  assessmentId: string;

  // @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  startDate: Date;

  // @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  endDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  matchCommitteeId: Array<Types.ObjectId>;
}

export class ClassHasAssessmentBodyDto extends PickType(
  ClassHasAssessmentCreateDto,
  ['startDate', 'endDate', 'matchCommitteeId'] as const,
) {}

export class ClassHasAssessmentStatusDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  classId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  assessmentId: string;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

export class ClassHasAssessmentStatusBodyDto extends PickType(
  ClassHasAssessmentStatusDto,
  ['status'] as const,
) {}
