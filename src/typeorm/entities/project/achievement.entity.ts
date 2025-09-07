import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity()
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column('text')
  description: string;

  @Column('date')
  achievementDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Project, (project) => project.achievements)
  @Index()
  project: Project;
}
