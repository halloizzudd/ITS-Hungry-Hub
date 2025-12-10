import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('Users:', JSON.stringify(users, null, 2));
    const products = await prisma.product.findMany();
    console.log('Products:', JSON.stringify(products, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
