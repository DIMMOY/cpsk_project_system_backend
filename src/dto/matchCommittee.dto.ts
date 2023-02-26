import { IsNotEmpty, IsString } from 'class-validator';

export class MatchCommitteeCreateDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
