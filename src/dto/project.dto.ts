import { Transform, Type } from 'class-transformer';
import { ValidateIf, IsString, IsNotEmpty, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

export class ProjectCreateDto {
  //ทดลองสำหรับ userId ต้องกลับมาแก้นะ
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  userId: Types.ObjectId;

  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  @Transform(toMongoObjectId)
  classId: Types.ObjectId;

  @IsString()
  nameTH: string;

  @IsString()
  nameEN: string;

  @ValidateIf((o) => o.description != null)
  @IsString()
  description: string | null;

  @IsArray()
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  partners: Types.ObjectId[];

  @IsArray()
  @Type(() => Types.ObjectId)
  @Transform(({ value, key }) =>
    value.map((id) => toMongoObjectId({ value: id, key })),
  )
  advisors: Types.ObjectId[];
}
