import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

function toMongoObjectId({ value, key }): Types.ObjectId {
  if (
    Types.ObjectId.isValid(value) &&
    new Types.ObjectId(value).toString() === value
  ) {
    return new Types.ObjectId(value);
  } else {
    throw new BadRequestException(`${key} is not a valid MongoId`);
  }
}

export class ChangeCurrentRoleDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  userId: Types.ObjectId;

  @IsIn([0, 1, 2])
  role: number;
}
