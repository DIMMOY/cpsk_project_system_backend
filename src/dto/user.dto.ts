import { IsEmail, IsISO8601, IsString, IsUrl, Matches } from 'class-validator';

export class ChangeImageUserDto {
  @IsUrl()
  imageUrl: string;
}

export class ChangeDisplayNameUserDto {
  @IsString()
  @Matches(/^[\u0E00-\u0E7F]*$/)
  name: string;

  @IsString()
  @Matches(/^[\u0E00-\u0E7F]*$/)
  surname: string;
}
