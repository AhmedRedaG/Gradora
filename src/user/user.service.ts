import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthUtilsService } from 'src/auth-utils/auth-utils.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthUtilsService))
    private authUtilsService: AuthUtilsService,
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
    password.at(0); // ts -_-

    return result;
  }

  async confirmVerification(userId: string) {
    return await this.userRepository.update(userId, { isVerified: true });
  }

  async setPassword(userId: string, password: string) {
    const hashedPassword = await this.authUtilsService.hashPassword(password);

    return await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }
}
