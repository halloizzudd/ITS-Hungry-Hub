import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSellerProfileDto } from './dto/create-seller-profile.dto';
import { SellerProfile } from '@prisma/client';

@Injectable()
export class SellerProfilesService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(status?: string): Promise<SellerProfile[]> {
    const where = status ? { verificationStatus: status } : {};
    return this.prisma.sellerProfile.findMany({
      where,
      orderBy: { id: 'desc' },
    });
  }

  async create(
    user: any,
    dto: CreateSellerProfileDto,
    files: any,
  ): Promise<SellerProfile> {
    // Construct file paths (names) for storing in the DB
    const photoKtpUrl = `uploads/${files.photoKtp[0].filename}`;
    const photoStallUrl = `uploads/${files.photoStall[0].filename}`;
    const qrisImageUrl = `uploads/${files.qrisImage[0].filename}`;

    // Create the seller profile with the user's ID and verification status
    const sellerProfile = await this.prisma.sellerProfile.create({
      data: {
        stallName: dto.stallName,
        description: dto.description,
        location: dto.location,
        photoKtpUrl,
        photoStallUrl,
        qrisImageUrl,
        userId: user.id, // Set the userId from the logged-in user
        verificationStatus: 'UNVERIFIED', // Default status is UNVERIFIED
      },
    });

    return sellerProfile;
  }

  async verifySeller(
    id: number,
    status: string,
    rejectionReason?: string,
  ): Promise<SellerProfile> {
    // Admin-only: Update the verification status of a seller profile
    return await this.prisma.sellerProfile.update({
      where: { id },
      data: {
        verificationStatus: status,
        rejectionReason: rejectionReason ?? null,
      },
    });
  }

  async getStats(userId: number) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const totalRevenue = await this.prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        sellerId: seller.id,
        status: 'COMPLETED',
      },
    });

    const totalOrders = await this.prisma.order.count({
      where: { sellerId: seller.id },
    });

    const pendingOrders = await this.prisma.order.count({
      where: {
        sellerId: seller.id,
        status: { in: ['PENDING', 'PROCESSING', 'PAID'] }, // Include PAID as active/pending
      },
    });

    const lowStockProducts = await this.prisma.product.findMany({
      where: {
        sellerId: seller.id,
        stock: { lt: 10 },
      },
      select: { name: true, stock: true },
    });

    // Sales Trends (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const ordersLast7Days = await this.prisma.order.findMany({
      where: {
        sellerId: seller.id,
        status: 'COMPLETED',
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, totalAmount: true },
    });

    const salesTrend = new Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      return { date: dateStr, amount: 0 };
    }).reverse();

    ordersLast7Days.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const trendItem = salesTrend.find(item => item.date === dateStr);
      if (trendItem) {
        trendItem.amount += order.totalAmount;
      }
    });

    // Revenue Breakdown
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const [dailyRev, weeklyRev, monthlyRev] = await Promise.all([
      this.prisma.order.aggregate({ _sum: { totalAmount: true }, where: { sellerId: seller.id, status: 'COMPLETED', createdAt: { gte: today } } }),
      this.prisma.order.aggregate({ _sum: { totalAmount: true }, where: { sellerId: seller.id, status: 'COMPLETED', createdAt: { gte: thisWeek } } }),
      this.prisma.order.aggregate({ _sum: { totalAmount: true }, where: { sellerId: seller.id, status: 'COMPLETED', createdAt: { gte: thisMonth } } }),
    ]);

    return {
      revenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      pendingCount: pendingOrders,
      lowStockItems: lowStockProducts,
      salesTrend,
      periods: {
        daily: dailyRev._sum.totalAmount || 0,
        weekly: weeklyRev._sum.totalAmount || 0,
        monthly: monthlyRev._sum.totalAmount || 0,
      },
    };
  }
}
