import { PickType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';
export class ClassHasMeetingScheduleCreateDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  classId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  meetingScheduleId: string;

  // @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  startDate: Date;

  // @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  endDate: Date;
}

export class ClassHasMeetingScheduleBodyDto extends PickType(
  ClassHasMeetingScheduleCreateDto,
  ['startDate', 'endDate'] as const,
) {}

export class ClassHasMeetingScheduleStatusDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  classId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  meetingScheduleId: string;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

export class ClassHasMeetingScheduleStatusBodyDto extends PickType(
  ClassHasMeetingScheduleStatusDto,
  ['status'] as const,
) {}
