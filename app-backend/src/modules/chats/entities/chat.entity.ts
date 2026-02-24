import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ChatType {
  DIRECT = 'direct',
}

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ChatType,
    default: ChatType.DIRECT,
  })
  type: ChatType;

  @CreateDateColumn()
  createdAt: Date;
}
