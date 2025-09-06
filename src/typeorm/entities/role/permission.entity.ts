import { Entity, ManyToMany } from 'typeorm';
import { Role } from './role.entity';
import { RolePermissionContent } from 'src/typeorm/abstractions/rolePermissionContent.abstract';

@Entity()
export class Permission extends RolePermissionContent {
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
