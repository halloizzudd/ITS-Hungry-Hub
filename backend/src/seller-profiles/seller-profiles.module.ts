import { Module } from '@nestjs/common';
import { SellerProfilesService } from './seller-profiles.service';
import { SellerProfilesController } from './seller-profiles.controller';
import { PrismaModule } from '../prisma.module';
import { SalesReportService } from './sales-report.service';

@Module({
  imports: [PrismaModule],  // Import PrismaModule here
  providers: [SellerProfilesService, SalesReportService],
  controllers: [SellerProfilesController],
})
export class SellerProfilesModule { }
