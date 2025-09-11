import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';

export enum GetUserByOptions {
  id = 'id',
  email = 'email',
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneBy({ email });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async create(userDto: CreateUserDto): Promise<User> {
    const isUserExist = await this.findByEmail(userDto.email);
    if (isUserExist) {
      throw new ConflictException('user exists with this email');
    }

    const { password, ...result } = await this.userRepository.save(userDto);

    return result;
  }

  async confirmVerification(userId: string) {
    return await this.userRepository.update(userId, { isVerified: true });
  }
}
