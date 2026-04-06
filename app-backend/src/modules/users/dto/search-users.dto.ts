import { IsString, MinLength, MaxLength } from 'class-validator';

export class SearchUsersDto {
  @IsString()
  @MinLength(3, { message: 'Search query must be at least 3 characters' })
  @MaxLength(50, { message: 'Search query must not exceed 50 characters' })
  query: string;
}
