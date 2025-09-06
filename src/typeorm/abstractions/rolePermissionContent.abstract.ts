import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class RolePermissionContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
