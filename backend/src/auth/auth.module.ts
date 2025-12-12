import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module'; // Assuming you have UsersModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module'; 

@Module({
  imports: [
    MailModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY', // Use environment variable for production
      signOptions: { expiresIn: '1d' }, // Set JWT expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule { }
