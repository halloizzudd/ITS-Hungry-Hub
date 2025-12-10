import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SalesReportService {
    private readonly logger = new Logger(SalesReportService.name);

    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
    ) { }

    // Run every Sunday at midnight (or use CronExpression.EVERY_WEEK)
    @Cron(CronExpression.EVERY_WEEK)
    async handleWeeklyReport() {
        this.logger.log('Starting weekly sales report generation...');

        // 1. Get all verified sellers
        const sellers = await this.prisma.sellerProfile.findMany({
            where: { verificationStatus: 'VERIFIED' },
            include: { user: true },
        });

        // 2. Define time range (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        for (const seller of sellers) {
            if (!seller.user?.email) continue;

            // 3. Aggregate orders
            const orders = await this.prisma.order.findMany({
                where: {
                    sellerId: seller.id,
                    status: 'COMPLETED', // Only count completed orders? Or all? Usually sales = completed/money received.
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            });

            if (orders.length === 0) continue;

            const totalOrders = orders.length;
            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

            // 4. Send Email
            await this.mailService.sendWeeklySalesReport(seller.user.email, {
                totalOrders,
                totalRevenue,
            });

            this.logger.log(`Sent weekly report to ${seller.stallName} (${seller.user.email})`);
        }
    }
}
