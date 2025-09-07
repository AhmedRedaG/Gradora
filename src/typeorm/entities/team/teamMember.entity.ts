import { Entity, ManyToOne } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../user/user.entity';
import { TeamUserContent } from 'src/typeorm/abstractions/teamUserContent.abstract';

@Entity()
export class TeamMember extends TeamUserContent {
  @ManyToOne(() => Team, (team) => team.teamMembers)
  team: Team;

  @ManyToOne(() => User, (user) => user.teamMembers)
  user: User;
}
