import { IsOptional, IsString } from 'class-validator';

export class GetChatsDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  limit?: number = 20;
}
