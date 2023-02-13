import { IsIn } from 'class-validator';
export class ChangeCurrentRoleDto {
  @IsIn([0, 1, 2])
  role: number;
}
