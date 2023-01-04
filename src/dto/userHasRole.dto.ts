import { Transform, Type } from 'class-transformer';
import { IsIn, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class ChangeCurrentRoleDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  userId: Types.ObjectId;

  @IsIn([0, 1, 2])
  role: number;
}
