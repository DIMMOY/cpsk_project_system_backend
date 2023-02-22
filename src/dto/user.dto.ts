import { IsEmail, IsISO8601, IsString, IsUrl } from 'class-validator';

export class CreateOrUpdateUserDto {
  @IsUrl()
  imageUrl: string;
}
