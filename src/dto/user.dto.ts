import { IsEmail, IsISO8601, IsString } from 'class-validator';

export class CreateOrUpdateUserDto {
  @IsISO8601()
  lastLoginAt: Date;
}
