import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentProfile } from './studentProfile.entity';
import { SupervisorProfile } from './supervisorProfile.entity';
import { Otp } from '../auth/otp.entity';
import { RefreshToken } from '../auth/refreshToken.entity';
import { Session } from '../auth/session.entity';
import { Role } from '../role/role.entity';
import { TeamMember } from '../team/teamMember.entity';
import { TeamSupervisor } from '../team/teamSupervisor.entity';
import { AuthAttempt } from '../auth/authAttempt.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  firstName: string;

  @Column({ length: 150 })
  lastName: string;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column('text') // using hash
  password?: string;

  @Column('boolean', { default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => StudentProfile, (studentProfile) => studentProfile.user)
  studentProfile: StudentProfile;

  @OneToOne(
    () => SupervisorProfile,
    (supervisorProfile) => supervisorProfile.user,
  )
  supervisorProfile: SupervisorProfile;

  @OneToOne(() => AuthAttempt, (authAttempt) => authAttempt.user)
  authAttempt: AuthAttempt;

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  teamMembers: TeamMember[];

  @OneToMany(() => TeamSupervisor, (teamSupervisor) => teamSupervisor.user)
  teamSupervisors: TeamSupervisor[];

  @ManyToOne(() => Role, (role) => role.users)
  @Index()
  role: Role;
}
