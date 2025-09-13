import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date', { nullable: true })
  graduationDate: Date;

  @Column({ length: 256, nullable: true })
  linkedinUrl: string;

  @Column({ length: 256, nullable: true })
  githubUrl: string;

  @Column({ length: 256, nullable: true })
  portfolioUrl: string;

  @Column('text', { nullable: true })
  skills: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
