import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SupervisorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 100 })
  scientificDegree: string;

  @Column('text', { nullable: true })
  researchInterests: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
