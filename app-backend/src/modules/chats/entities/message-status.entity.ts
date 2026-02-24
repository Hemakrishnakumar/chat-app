import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('message_status')
export class MessageStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  messageId: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  deliveredAt?: Date;

  @Column({ nullable: true })
  readAt?: Date;
}
