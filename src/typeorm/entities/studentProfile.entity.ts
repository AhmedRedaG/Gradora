import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class StudentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('date', { nullable: true })
  graduationDate: Date;

  @Column({ nullable: true })
  linkedinUrl: string;

  @Column({ nullable: true })
  githubUrl: string;

  @Column({ nullable: true })
  portfolioUrl: string;

  @Column('text', { nullable: true })
  skills: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
