import { IsString } from 'class-validator';

export class JoinClassDto {
  @IsString()
  inviteCode: string;
}
