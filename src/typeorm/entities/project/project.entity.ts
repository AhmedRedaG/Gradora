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

  @Column({ length: 150, unique: true })
  title: string;

  @Column('text')
  description: string;

  // need more
  @Column()
  year: number;

  @Column('text')
  techStack: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  reportUrl: string;

  @Column({ nullable: true })
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
