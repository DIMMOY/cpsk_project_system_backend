import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class MeetingScheduleCreateDto {
  @IsString()
  name: string;
}

export class MeetingScheduleUpdateDto extends PartialType(
  MeetingScheduleCreateDto,
) {}
