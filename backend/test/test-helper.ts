import { PrismaClient } from '@prisma/client';

export class TestHelper {
    constructor(private readonly prisma: PrismaClient) { }

    async cleanDatabase() {
        const dbUrl = process.env.DATABASE_URL;

        // CRITICAL SAFETY GUARD
        if (!dbUrl || !dbUrl.includes('test')) {
            console.error('CRITICAL ERROR: Attempted to clean non-test database!');
            console.error(`Current DATABASE_URL: ${dbUrl}`);
            throw new Error(
                'DANGER: Aborting database cleanup. You are currently connected to a NON-TEST database! ' +
                'Please ensure DATABASE_URL contains "test".'
            );
        }

        // Order matters for foreign key constraints
        const tableNames = [
            'order_items',
            'orders',
            'product_images',
            'products',
            'seller_profiles',
            'users',
        ];

        try {
            // Disable foreign keys for cleanup (SQLite specific, but safer generally)
            // Actually standard TRUNCATE or DELETE FROM works, but order matters.
            // For SQLite: 'PRAGMA foreign_keys = OFF;' might be needed if not cascading.
            // But let's try standard delete first.

            for (const tableName of tableNames) {
                // Use executeRaw for flexibility or specific deleteMany
                // await this.prisma.$executeRawUnsafe(`DELETE FROM ${tableName};`); 
                // Better to use deleteMany() if possible but generic approach is harder with types.
                // Let's use the explicit models based on schema.
            }

            // Explicit deletion to be type safe and avoid raw un-safe queries if possible
            // But generic cleanup is cleaner. Let's do raw for full cleanup.

            await this.prisma.$transaction([
                this.prisma.orderItem.deleteMany(),
                this.prisma.order.deleteMany(),
                this.prisma.productImage.deleteMany(),
                this.prisma.product.deleteMany(),
                this.prisma.sellerProfile.deleteMany(),
                this.prisma.user.deleteMany(),
            ]);

        } catch (error) {
            console.error('Error cleaning database:', error);
            throw error;
        }
    }
}
