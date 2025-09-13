import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user/user.entity';
import { AuthUtilsModule } from 'src/auth-utils/auth-utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthUtilsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
