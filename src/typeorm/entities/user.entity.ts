import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  password: string;

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
}
