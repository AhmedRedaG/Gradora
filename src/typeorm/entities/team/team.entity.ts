import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TeamMember } from './teamMember.entity';
import { TeamSupervisor } from './teamSupervisor.entity';
import { Project } from '../project/project.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 150 })
  name: string;

  @Column('boolean', { default: false })
  isPublic: boolean;

  @Column('boolean', { default: false })
  isOfficial: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  teamMembers: TeamMember[];

  @OneToMany(() => TeamSupervisor, (teamSupervisor) => teamSupervisor.team)
  teamSupervisors: TeamSupervisor[];

  @OneToMany(() => Project, (project) => project.team)
  projects: Project[];
}
