import { Column, Index, PrimaryColumn } from 'typeorm';

export abstract class TeamUserContent {
  @Column({ length: 256 })
  role: string;

  @PrimaryColumn()
  @Index()
  teamId: string;

  @PrimaryColumn()
  @Index()
  userId: string;
}
