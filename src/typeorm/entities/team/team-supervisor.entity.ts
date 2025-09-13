import { Entity, ManyToOne } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../user/user.entity';
import { TeamUserContent } from 'src/typeorm/abstractions/team-user-content.abstract';

@Entity()
export class TeamSupervisor extends TeamUserContent {
  @ManyToOne(() => Team, (team) => team.teamSupervisors)
  team: Team;

  @ManyToOne(() => User, (user) => user.teamSupervisors)
  user: User;
}
