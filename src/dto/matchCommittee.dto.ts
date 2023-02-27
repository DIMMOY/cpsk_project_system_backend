import { PickType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsISO8601, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class MatchCommitteeCreateDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class MatchCommitteeStatusDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  classId: string;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  matchCommitteeId: string;

  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}

export class MatchCommitteeSetDateDto {
  @IsISO8601()
  startDate: Date;
}

export class MatchCommitteeSetStatusDto {
  @IsBoolean()
  status: Date;
}
