import { PickType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ValidateIf,
  IsString,
  IsISO8601,
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class ClassHasDocumentCreateDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  classId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  documentId: string;

  // @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  startDate: Date;

  // @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  endDate: Date;
}

export class ClassHasDocumentBodyDto extends PickType(
  ClassHasDocumentCreateDto,
  ['startDate', 'endDate'] as const,
) {}
