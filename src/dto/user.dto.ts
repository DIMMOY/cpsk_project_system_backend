import { IsEmail, IsISO8601, IsString } from 'class-validator';

export class CreateOrUpdateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  displayName: string;

  @IsISO8601()
  lastLoginAt: Date;
}
