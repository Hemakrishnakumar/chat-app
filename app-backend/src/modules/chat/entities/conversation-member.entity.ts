import { Conversation } from 'src/modules/chat/entities/conversation.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('conversation_members')
@Unique(['conversationId', 'userId']) // 🔥 prevents duplicates
export class ConversationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 🔹 Conversation FK
  @Index()
  @Column({ name: 'conversation_id' })
  conversationId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // 🔹 User FK
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 🔹 Role (for group chats)
  @Column({
    type: 'varchar',
    default: MemberRole.MEMBER,
  })
  role: MemberRole;

  // 🔥 MOST IMPORTANT FIELD
  // Tracks last read message
  @Column({ name: 'last_read_message_id', nullable: true })
  lastReadMessageId: string;

  // 🔹 Join time
  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}