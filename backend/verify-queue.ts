import { OrdersService } from './src/orders/orders.service';
import { PrismaService } from './src/prisma.service';
import { OrderType } from './src/orders/entities/order.entity';

async function bootstrap() {
    // Manual instantiation to avoid TS Path issues in test script
    const prisma = new PrismaService();
    const mailService = { sendOrderConfirmation: async () => { }, sendOrderStatusUpdate: async () => { } } as any; // Mock MailService
    const ordersService = new OrdersService(prisma, mailService);

    await prisma.$connect(); // Connect DB

    console.log('--- Starting Queue Verification ---');

    // 1. Setup Data
    const email = `test-${Date.now()}@test.com`;
    const user = await prisma.user.create({
        data: {
            email,
            password: 'password',
            name: 'Test Queue User',
            role: 'CONSUMER',
        },
    });

    const sellerEmail = `seller-${Date.now()}@test.com`;
    const sellerUser = await prisma.user.create({
        data: {
            email: sellerEmail,
            password: 'password',
            name: 'Test Seller',
            role: 'SELLER',
        }
    });

    const sellerProfile = await prisma.sellerProfile.create({
        data: {
            userId: sellerUser.id,
            stallName: 'Queue Test Stall',
            description: 'Testing Queue',
            location: 'Test Lab'
        }
    });

    const product = await prisma.product.create({
        data: {
            name: 'Slow Food',
            description: 'Takes 10 mins',
            price: 10000,
            stock: 100,
            category: 'Food',
            prepTime: 10, // 10 minutes
            sellerId: sellerProfile.id,
        },
    });

    // 2. Create Order A (Should start NOW, finish in 10 mins)
    console.log('Creating Order A...');
    const orderA = await ordersService.create(user.id, {
        sellerId: sellerProfile.id,
        orderType: OrderType.DINE_IN,
        items: [{ productId: product.id, quantity: 1 }],
    });

    if (!orderA.estimatedReadyAt) {
        console.error('❌ Order A estimatedReadyAt is null');
        process.exit(1);
    }
    const now = new Date();
    const readyA = new Date(orderA.estimatedReadyAt);
    const diffA = (readyA.getTime() - now.getTime()) / 60000;

    console.log(`Order A created at: ${now.toISOString()}`);
    console.log(`Order A ready at: ${readyA.toISOString()}`);
    console.log(`Order A duration (approx): ${diffA.toFixed(1)} mins (Expected ~10)`);

    if (diffA < 9 || diffA > 11) {
        console.error('❌ Order A timing incorrect');
        process.exit(1);
    }

    // 3. Create Order B (Should start AFTER Order A, finish 10 mins later = +20 mins from now)
    console.log('Creating Order B immediately...');
    const orderB = await ordersService.create(user.id, {
        sellerId: sellerProfile.id,
        orderType: OrderType.TAKE_AWAY,
        items: [{ productId: product.id, quantity: 1 }],
    });

    if (!orderB.estimatedReadyAt) {
        console.error('❌ Order B estimatedReadyAt is null');
        process.exit(1);
    }

    const readyB = new Date(orderB.estimatedReadyAt);
    const diffB_Total = (readyB.getTime() - now.getTime()) / 60000;
    const diffB_Gap = (readyB.getTime() - readyA.getTime()) / 60000;

    console.log(`Order B ready at: ${readyB.toISOString()}`);
    console.log(`Order B total duration from start: ${diffB_Total.toFixed(1)} mins (Expected ~20)`);
    console.log(`Gap betwen A and B: ${diffB_Gap.toFixed(1)} mins (Expected ~10)`);

    if (diffB_Total < 19 || diffB_Total > 21) {
        console.error('❌ Order B timing incorrect (Queue logic failed)');
        process.exit(1);
    }

    console.log('✅ Queue Logic Verified Successfully!');

    // Cleanup
    await prisma.orderItem.deleteMany({ where: { orderId: { in: [orderA.id, orderB.id] } } });
    await prisma.order.deleteMany({ where: { id: { in: [orderA.id, orderB.id] } } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.sellerProfile.delete({ where: { id: sellerProfile.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, sellerUser.id] } } });

    await prisma.$disconnect(); // Disconnect
}

bootstrap();
