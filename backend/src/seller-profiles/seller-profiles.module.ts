import { Module } from '@nestjs/common';
import { SellerProfilesService } from './seller-profiles.service';
import { SellerProfilesController } from './seller-profiles.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],  // Import PrismaModule here
  providers: [SellerProfilesService],
  controllers: [SellerProfilesController],
})
export class SellerProfilesModule {}
