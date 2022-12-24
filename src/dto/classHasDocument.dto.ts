import { PartialType } from '@nestjs/mapped-types';
import { ValidateIf, IsString, IsISO8601, IsIn } from 'class-validator';

export class ClassHasDocumentCreateDto {
  @IsString()
  classId: string;

  @IsString()
  documentId: string;

  @ValidateIf((o) => o.endDate != null)
  @IsISO8601()
  endDate: Date | null;
}

// export class ClassUpdateDto extends PartialType(ClassHasProjectCreateDto) {}
