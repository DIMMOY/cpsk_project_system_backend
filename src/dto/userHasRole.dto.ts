import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class ChangeCurrentRoleDto {
  @IsIn([0, 1, 2])
  role: number;
}
export class CreateUserInRoleDto {
  @IsIn([1, 2])
  role: number;

  @IsEmail()
  email: string;
}
export class DeleteUserInRoleDto {
  @IsIn([1, 2])
  role: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  userId: Array<Types.ObjectId>;
}

export class FindRoleDto extends PartialType(ChangeCurrentRoleDto) {}
