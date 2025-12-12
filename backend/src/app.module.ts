import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service'; // Correct import for AuthService
import { JwtStrategy } from './auth/strategies/jwt.strategy'; // Correct import for JwtStrategy
import { AuthModule } from './auth/auth.module';
import { FileUploadService } from './utils/file-upload.service'; // Correct import for FileUploadService
import { SellerProfilesModule } from './seller-profiles/seller-profiles.module';
import { PrismaModule } from './prisma.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule, // Add PrismaModule to make it globally available
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), // Serve files from ../../uploads directory (relative to dist/src)
      serveRoot: '/api/uploads', // Files will be accessible under /api/uploads path
    }),
    SellerProfilesModule, // Add SellerProfiles module to imports
    AuthModule, // Add AuthModule to imports
    ProductsModule,
    OrdersModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, FileUploadService], // Provide only FileUploadService at root; AuthService and JwtStrategy are provided by AuthModule
})
export class AppModule { }
