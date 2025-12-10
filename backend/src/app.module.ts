import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthService } from './auth/auth.service'; // Correct import for AuthService
import { JwtStrategy } from './auth/strategies/jwt.strategy'; // Correct import for JwtStrategy
import { AuthModule } from './auth/auth.module';
import { FileUploadService } from './utils/file-upload.service'; // Correct import for FileUploadService
import { SellerProfilesModule } from './seller-profiles/seller-profiles.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule, // Add PrismaModule to make it globally available
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), // Serve files from ./uploads directory
      serveRoot: '/uploads', // Files will be accessible under /uploads path
    }),
    SellerProfilesModule, // Add SellerProfiles module to imports
    AuthModule, // Add AuthModule to imports
    ProductsModule,
    OrdersModule,
    UsersModule,
    MailModule,
  ],
  controllers: [],
  providers: [FileUploadService], // Provide only FileUploadService at root; AuthService and JwtStrategy are provided by AuthModule
})
export class AppModule { }
