import { Column, Index, PrimaryColumn } from 'typeorm';

export abstract class TeamUserContent {
  @Column()
  role: string;

  @PrimaryColumn()
  @Index()
  teamId: string;

  @PrimaryColumn()
  @Index()
  userId: string;
}
