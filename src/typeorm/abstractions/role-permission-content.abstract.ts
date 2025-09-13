import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class RolePermissionContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 256 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
