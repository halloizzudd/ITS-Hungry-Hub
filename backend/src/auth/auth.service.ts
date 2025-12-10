import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service'; // Assuming you have a PrismaService
import { CreateUserDto } from 'src/users/dto/create-user.dto'; // Your DTO for user registration

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(dto: CreateUserDto) {
    // Check if the email already exists
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || 'CONSUMER', // Use provided role or default
      },
    });

    // Exclude password from the response
    return {
      message: 'User registered',
      user: { ...user, password: undefined },
    };
  }

  async validateUser(email: string, pass: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If user not found or password does not match, return null
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      return null;
    }
    return user;
  }

  async login(user: any) {
    // Generate JWT access token
    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: 'SECRET_KEY', // Use a secret key (preferably environment variable)
        expiresIn: '1d', // Set token expiration
      }),
    };
  }
}
