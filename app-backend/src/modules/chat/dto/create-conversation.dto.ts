import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { ChatType } from "../entities/conversation.entity";

export class CreateConversationDto {
    @IsEnum(ChatType)
    type: ChatType;

    @IsOptional()
    @IsString()    
    name?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    participantIds: string[];

    @IsString()
    content: string;
}