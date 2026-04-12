import { Conversation } from 'src/modules/chat/entities/conversation.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 🔹 Conversation FK
  @Index()
  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // 🔹 Sender FK
  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  // 🔹 Message type
  @Column({ type: 'varchar' })
  type: MessageType;

  // 🔹 Content (text)
  @Column({ type: 'text', nullable: true })
  content: string;

  // 🔹 File support
  @Column({ name: 'file_url', nullable: true })
  fileUrl: string;

  // 🔹 Created time (ordering)
  @CreateDateColumn({type:'timestamptz', name: 'created_at' })
  createdAt: Date;

  // 🔥 Soft delete (VERY IMPORTANT)
  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}