import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class AuthAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  verificationAttempts: number;

  @CreateDateColumn()
  lastVerificationAttempt: Date;

  @Column('int', { default: 0 })
  loginAttempts: number;

  @OneToOne(() => User, (user) => user.authAttempt)
  @JoinColumn()
  user: User;
}
