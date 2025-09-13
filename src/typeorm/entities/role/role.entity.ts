import { Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../user/user.entity';
import { RolePermissionContent } from 'src/typeorm/abstractions/role-permission-content.abstract';

@Entity()
export class Role extends RolePermissionContent {
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable()
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
