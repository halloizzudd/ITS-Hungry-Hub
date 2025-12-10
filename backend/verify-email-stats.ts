import { OrdersService } from './src/orders/orders.service';
import { PrismaService } from './src/prisma.service';
import { MailService } from './src/mail/mail.service';
import { SellerProfilesService } from './src/seller-profiles/seller-profiles.service';
import { OrderType } from './src/orders/entities/order.entity';

async function bootstrap() {
    const prisma = new PrismaService();
    // Mock ConfigService to return a dummy password (or read from env if possible)
    const configServiceMock = { get: () => 'dummy-pass' } as any; // Using dummy pass will cause auth error if real Gmail is hit
    const mailService = new MailService(configServiceMock);
    const ordersService = new OrdersService(prisma, mailService);
    const sellerService = new SellerProfilesService(prisma);

    await prisma.$connect();
    console.log('--- Starting Email & Stats Verification ---');

    // 1. Setup Data
    const email = `test-stats-${Date.now()}@test.com`;
    const user = await prisma.user.create({
        data: { email, password: 'pw', name: 'Stats User', role: 'CONSUMER' },
    });

    const sellerUser = await prisma.user.create({
        data: { email: `seller-stats-${Date.now()}@test.com`, password: 'pw', name: 'Stats Seller', role: 'SELLER' },
    });

    const sellerProfile = await prisma.sellerProfile.create({
        data: { userId: sellerUser.id, stallName: 'Stats Stall', description: 'desc', location: 'loc' },
    });

    const product = await prisma.product.create({
        data: { name: 'Stats Item', description: 'desc', price: 50000, stock: 5, prepTime: 5, sellerId: sellerProfile.id, category: 'Food' },
    });

    // 2. Create Order -> Should trigger Email LOG
    console.log('Creating Order (expect Email Log)...');
    const order = await ordersService.create(user.id, {
        sellerId: sellerProfile.id,
        orderType: OrderType.DINE_IN,
        items: [{ productId: product.id, quantity: 2 }],
    });

    // 3. Update Status -> Should trigger Email LOG
    console.log('Updating Order to PROCESSING (expect Email Log)...');
    await ordersService.update(order.id, { status: 'PROCESSING' });

    // 4. Update Status to COMPLETED -> Revenue should count
    console.log('Completing Order...');
    await ordersService.update(order.id, { status: 'COMPLETED' });

    // 5. Check Stats
    console.log('Fetching Stats...');
    const stats = await sellerService.getStats(sellerUser.id);
    console.log('Stats Result:', JSON.stringify(stats, null, 2));

    if (stats.revenue !== 100000) {
        console.error('❌ Revenue incorrect. Expected 100000');
        process.exit(1);
    }
    if (stats.totalOrders !== 1) {
        console.error('❌ Total Orders incorrect');
        process.exit(1);
    }
    if (stats.lowStockItems.length !== 1) {
        console.error('❌ Low Stock Alert missing (Stock is 5)');
        process.exit(1);
    }

    console.log('✅ Email & Analytics Verified!');

    // Cleanup
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.sellerProfile.delete({ where: { id: sellerProfile.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, sellerUser.id] } } });

    await prisma.$disconnect();
}

bootstrap();
