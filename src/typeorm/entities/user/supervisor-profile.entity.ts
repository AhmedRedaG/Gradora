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
export class SupervisorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256 })
  department: string;

  @Column({ length: 256 })
  scientificDegree: string;

  @Column('text', { nullable: true })
  researchInterests: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
