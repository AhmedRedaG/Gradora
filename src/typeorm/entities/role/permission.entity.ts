import { Entity, ManyToMany } from 'typeorm';
import { Role } from './role.entity';
import { RolePermissionContent } from 'src/typeorm/abstractions/role-permission-content.abstract';

@Entity()
export class Permission extends RolePermissionContent {
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
