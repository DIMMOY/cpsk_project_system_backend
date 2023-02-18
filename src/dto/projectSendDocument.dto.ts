import { PartialType, PickType } from '@nestjs/mapped-types';
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
} from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class ProjectSendDocumentCreateDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  projectId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  documentId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  pathDocument: Array<string>;
}

export class ProjectSendDocumentDeleteDto extends PickType(
  ProjectSendDocumentCreateDto,
  ['projectId', 'documentId'] as const,
) {}

export class ProjectSendDocumenteBodyDto extends PickType(
  ProjectSendDocumentCreateDto,
  ['pathDocument'] as const,
) {}
