import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class ProjectSendMeetingScheduleCreateDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  projectId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  documentId: string;
}

// export class ClassUpdateDto extends PartialType(ClassHasProjectCreateDto) {}
