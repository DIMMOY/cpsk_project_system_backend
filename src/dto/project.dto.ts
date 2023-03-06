import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ValidateIf,
  IsString,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class ProjectCreateDto {
  @IsString()
  @Matches(/^[\u0E00-\u0E7F A-Za-z 0-9(),.-]*$/)
  nameTH: string;

  @IsString()
  @Matches(/^[A-Za-z 0-9(),.-]*$/)
  nameEN: string;

  @ValidateIf((o) => o.description != null)
  @IsString()
  description: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  partners: Array<Types.ObjectId>;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  advisors: Array<Types.ObjectId>;
}

export class ProjectUpdateDto extends PartialType(ProjectCreateDto) {}
