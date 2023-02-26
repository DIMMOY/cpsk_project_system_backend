import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class MatchCommitteeHasGroupCreateDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  userId: Array<Types.ObjectId>;
}

export class MatchCommitteeHasGroupCreateWithProjectDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  createInGroup: Array<Types.ObjectId>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  deleteInGroup: Array<Types.ObjectId>;
}
