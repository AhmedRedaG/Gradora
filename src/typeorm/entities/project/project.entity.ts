import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from '../team/team.entity';
import { Achievement } from './achievement.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 256, unique: true })
  title: string;

  @Column('text')
  description: string;

  // need more
  @Column('smallint')
  year: number;

  @Column('text')
  techStack: string;

  @Column({ length: 256, nullable: true })
  githubUrl: string;

  @Column({ length: 256, nullable: true })
  reportUrl: string;

  @Column({ length: 256, nullable: true })
  demoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Achievement, (achievement) => achievement.project)
  achievements: Achievement[];

  @ManyToOne(() => Team, (team) => team.projects)
  @Index()
  team: Team;
}
