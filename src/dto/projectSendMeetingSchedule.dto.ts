import { PartialType, PickType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
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
  meetingScheduleId: string;

  @IsNotEmpty()
  @IsString()
  detail: string;
}

export class ProjectSendMeetingScheduleDeleteDto extends PickType(
  ProjectSendMeetingScheduleCreateDto,
  ['projectId', 'meetingScheduleId'] as const,
) {}

export class ProjectSendMeetingScheduleChangeStatusDto {
  @IsBoolean()
  status: boolean;
}

export class ProjectSendMeetingScheduleBodyDto extends PickType(
  ProjectSendMeetingScheduleCreateDto,
  ['detail'] as const,
) {}
