import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export function toMongoObjectId({ value, key }): Types.ObjectId {
  if (
    Types.ObjectId.isValid(value) &&
    new Types.ObjectId(value).toString() === value
  ) {
    return new Types.ObjectId(value);
  } else {
    throw new BadRequestException(`${key} is not a valid MongoId`);
  }
}
