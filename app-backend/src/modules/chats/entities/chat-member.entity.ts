import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('chat_members')
export class ChatMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chatId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  joinedAt: Date;
}
