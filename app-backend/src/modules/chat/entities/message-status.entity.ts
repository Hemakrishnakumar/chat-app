import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Message } from 'src/modules/chat/entities/message.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('message_receipts')
@Unique(['messageId', 'userId'])
export class MessageReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 🔹 Message FK
  @Index()
  @Column({ name: 'message_id' })
  messageId: string;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  // 🔹 User FK
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 🔹 Delivery tracking
  @Column({ name: 'delivered_at', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'read_at', nullable: true })
  readAt?: Date;
}