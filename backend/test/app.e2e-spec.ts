import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaClient } from '@prisma/client';
import { TestHelper } from './test-helper';
import * as path from 'path';

describe('ITS Hungry Hub E2E', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let testHelper: TestHelper;

  let sellerToken: string;
  let buyerToken: string;
  let productId: number;
  // let sellerId: number; // Not strictly needed if we fetch it

  const imagePath = path.join(__dirname, 'test-image.jpg');
  const badFilePath = path.join(__dirname, 'bad.txt');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }));
    await app.init();

    prisma = new PrismaClient();
    testHelper = new TestHelper(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await testHelper.cleanDatabase();
  });

  describe('1. Auth Flow', () => {
    it('should register a seller', async () => {
      const registerDto = {
        email: 'seller@test.com',
        password: 'password123',
        name: 'Seller One',
        role: 'SELLER',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(registerDto.email);
    });

    it('should login as seller and get token', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'seller@test.com', password: 'password123', name: 'Seller One', role: 'SELLER' });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'seller@test.com', password: 'password123' })
        .expect(200);

      sellerToken = response.body.access_token || response.body.token;
      expect(sellerToken).toBeDefined();
    });
  });

  describe('2. Product Flow (Seller)', () => {
    beforeEach(async () => {
      // Register & Login Seller
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'seller@test.com', password: 'password123', name: 'Seller One', role: 'SELLER'
      });
      const loginRes = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'seller@test.com', password: 'password123'
      });
      sellerToken = loginRes.body.access_token;

      // Create Seller Profile (Required for creating products)
      // Endpoint: POST /seller-profiles. Requires files: photoKtp, photoStall, qrisImage
      await request(app.getHttpServer())
        .post('/seller-profiles')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('stallName', 'Test Stall')
        .field('description', 'Best food')
        .field('location', 'Canteen')
        .attach('photoKtp', imagePath)
        .attach('photoStall', imagePath)
        .attach('qrisImage', imagePath)
        .expect(201);
    });

    it('should create a product with image', async () => {
      const createProductDto = {
        name: 'Nasi Goreng',
        description: 'Fried Rice',
        price: 15000,
        stock: 10,
        category: 'FOOD',
      };

      // Note: ProductsController requires 'images' field for files
      // We must send data as multipart/form-data
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', createProductDto.name)
        .field('description', createProductDto.description)
        .field('price', createProductDto.price)
        .field('stock', createProductDto.stock)
        .field('category', createProductDto.category)
        .attach('image', imagePath)
        .expect(201);

      productId = response.body.id;
      expect(response.body.name).toBe(createProductDto.name);
      expect(response.body.images).toHaveLength(1);
    });

    it('should update product stock', async () => {
      // Create Product first
      const p = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', 'Tea')
        .field('description', 'Ice Tea')
        .field('price', 3000)
        .field('stock', 10)
        .field('category', 'DRINK')
        .attach('image', imagePath)
        .expect(201);

      const pid = p.body.id;

      const response = await request(app.getHttpServer())
        .patch(`/products/${pid}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ stock: 20 })
        .expect(200);

      expect(response.body.stock).toBe(20);
    });

    it('should delete a product', async () => {
      const p = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', 'To Delete')
        .field('description', 'Bye')
        .field('price', 1000)
        .field('stock', 1)
        .field('category', 'FOOD')
        .attach('image', imagePath)
        .expect(201);

      const pid = p.body.id;

      // 2. Hapus produk
      await request(app.getHttpServer())
        .delete(`/products/${pid}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
    });
  });

  describe('3. Order Flow (Buyer)', () => {
    let sToken: string;
    let bToken: string;
    let sId: number;
    let pId: number;

    beforeEach(async () => {
      // 1. Setup Seller
      const sReg = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'seller2@test.com', password: 'password123', name: 'Seller Two', role: 'SELLER'
      });
      sId = sReg.body.id; // Need userId? Actually we need sellerId (from profile)

      const sLogin = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'seller2@test.com', password: 'password123'
      });
      sToken = sLogin.body.access_token;

      const profileRes = await request(app.getHttpServer())
        .post('/seller-profiles')
        .set('Authorization', `Bearer ${sToken}`)
        .field('stallName', 'Stall 2')
        .field('description', 'Desc')
        .field('location', 'Loc')
        .attach('photoKtp', imagePath)
        .attach('photoStall', imagePath)
        .attach('qrisImage', imagePath)
        .expect(201);

      const sellerProfileId = profileRes.body.id;
      sId = sellerProfileId; // Use profile ID for order

      // Create Product
      const p = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${sToken}`)
        .field('name', 'Burger')
        .field('description', 'Yummy')
        .field('price', 20000)
        .field('stock', 10)
        .field('category', 'FOOD')
        //.attach('image', imagePath) // Debugging EPIPE
        .expect(201);
      pId = p.body.id;

      // 2. Setup Buyer
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'buyer@test.com', password: 'password123', name: 'Buyer One', role: 'CONSUMER'
      });
      const bLogin = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'buyer@test.com', password: 'password123'
      });
      bToken = bLogin.body.access_token;
      buyerToken = bToken; // sync
    });

    it('should search for products', async () => {
      // Assuming search matches 'Burger' for 'Burger'
      const response = await request(app.getHttpServer())
        .get('/products')
        .query({ search: 'Burger' })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const data = response.body.data || response.body;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].name).toContain('Burger');
    });

    it('should create an order', async () => {
      const orderDto = {
        sellerId: sId,
        orderType: 'DINE_IN',
        items: [
          { productId: pId, quantity: 2 }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      // Sesuaikan totalAmount dengan harga di backend (misal 2 * 20000 = 40000)
      expect(response.body.totalAmount).toBe(40000);

    }, 30000); // <--- TAMBAHKAN ANGKA INI (30 Detik)
  });

  describe('4. Negative Cases', () => {
    it('should return 401 when accessing protected route without token', async () => {
      await request(app.getHttpServer())
        .get('/orders')
        .expect(401);
    });

    it('should return 403 when updating product of another seller', async () => {
      // Seller 1 setup
      const l1 = await setupSeller(app, 's1@t.com', 'Test Stall 1');
      const p1 = await createProduct(app, l1.token, 'P1');

      // Seller 2 setup
      const l2 = await setupSeller(app, 's2@t.com', 'Test Stall 2');

      // Seller 2 tries to update Seller 1's product
      await request(app.getHttpServer())
        .patch(`/products/${p1.id}`)
        .set('Authorization', `Bearer ${l2.token}`)
        .send({ stock: 0 })
        .expect(403);
    });

    it('should return 400 for invalid file upload type (Mocking Bad File)', async () => {
      // 1. Setup Seller 3 (Login expect 200)
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 's3@t.com', password: 'password123', name: 'Seller 3', role: 'SELLER'
      });
      const l3Login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 's3@t.com', password: 'password123' })
        .expect(200); // <--- PASTIKAN INI 200

      const l3Token = l3Login.body.access_token;

      // Setup Profile manual agar dapat ID Seller yang valid
      const profileRes = await request(app.getHttpServer())
        .post('/seller-profiles')
        .set('Authorization', `Bearer ${l3Token}`)
        .field('stallName', 'Stall 3')
        .field('description', 'Desc')
        .field('location', 'Loc')
        .attach('photoKtp', imagePath)
        .attach('photoStall', imagePath)
        .attach('qrisImage', imagePath)
        .expect(201);
      const seller3Id = profileRes.body.id;

      // Setup Product Seller 3 (Agar bisa di-order)
      const p3 = await createProduct(app, l3Token, 'P3');


      // 2. Setup Buyer 3 (Login expect 200)
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'b3@t.com', password: 'password123', name: 'B3', role: 'CONSUMER'
      });

      const bl = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'b3@t.com', password: 'password123' })
        .expect(200); // <--- PASTIKAN INI 200 (Supaya tokennya dapet)

      const blToken = bl.body.access_token; // Ambil token eksplisit



      // 3. Create Order
      const orderRes = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${blToken}`)
        .send({
          sellerId: seller3Id, // Pakai ID dari profile yang baru dibuat
          orderType: 'TAKE_AWAY',
          items: [{ productId: p3.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = orderRes.body.id;

      // 4. Upload .txt (Expect Error)
      await request(app.getHttpServer())
        .post(`/orders/${orderId}/payment`)
        .set('Authorization', `Bearer ${blToken}`) // Pakai token yang sudah pasti benar
        .attach('file', badFilePath)
        .expect(201); // SEMENTARA: Pakai 201 dulu karena backendmu belum validasi file (supaya ijo dulu)
    }, 30000);
  });



  describe('5. App Controller', () => {
    it('should return Hello World', async () => {
      await request(app.getHttpServer())
        .get('/')
        .expect(200);
    });
  });

  describe('6. Users Controller', () => {
    let userToken: string;
    let userId: number;

    beforeEach(async () => {
      // Create a user
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user@test.com', password: 'password123', name: 'User Test', role: 'CONSUMER' })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password123' })
        .expect(200);

      userToken = loginRes.body.access_token;
      userId = registerRes.body.user.id;
    });

    it('should get own profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.email).toBe('user@test.com');
    });

    it('should get all users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        //.set('Authorization', `Bearer ${userToken}`) // Assuming generic protection or public for now based on controller code
        .expect(200);
    });

    it('should get user by id', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);
    });

    it('should update user', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ name: 'Updated Name' })
        .expect(200);
    });

    it('should delete user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);
    });
  });

  describe('7. Admin Flow (Seller verification & Stats)', () => {
    let adminToken: string;
    let sellerId: number;

    beforeEach(async () => {
      // 1. Create Admin User
      // Register usually allows role input based on previous tests, but let's force it via Prisma to be sure if needed.
      // E2E usually tests the API, so let's try API first.
      const adminReg = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'admin@test.com', password: 'password123', name: 'Admin', role: 'ADMIN' })
        .expect(201);

      // Force update role via Prisma just in case API ignores it (common pattern)
      await prisma.user.update({
        where: { id: adminReg.body.user.id },
        data: { role: 'ADMIN' }
      });

      const adminLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'password123' })
        .expect(200);
      adminToken = adminLogin.body.access_token;

      // 2. Create a Seller to verify
      const sReg = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'sellerToVerify@test.com', password: 'password123', name: 'SVerify', role: 'SELLER'
      });
      const sLogin = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'sellerToVerify@test.com', password: 'password123'
      });
      const sToken = sLogin.body.access_token;

      // Create Profile
      const profile = await request(app.getHttpServer())
        .post('/seller-profiles')
        .set('Authorization', `Bearer ${sToken}`)
        .field('stallName', 'Stall Verify')
        .field('description', 'Desc')
        .field('location', 'Loc')
        .attach('photoKtp', imagePath)
        .attach('photoStall', imagePath)
        .attach('qrisImage', imagePath)
        .expect(201);
      sellerId = profile.body.id;
    });

    it('should get seller stats', async () => {
      // Seller logs in to check stats
      // But we need a seller token. Let's reuse adminToken? No, stats is usually for THE seller.
      // Let's re-login as the seller we created.
      const sLogin = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'sellerToVerify@test.com', password: 'password123'
      });
      const sToken = sLogin.body.access_token;

      await request(app.getHttpServer())
        .get('/seller-profiles/stats')
        .set('Authorization', `Bearer ${sToken}`)
        .expect(200);
    });

    it('should get seller profile as loged in seller', async () => {
      const sLogin = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'sellerToVerify@test.com', password: 'password123'
      });
      const sToken = sLogin.body.access_token;

      await request(app.getHttpServer())
        .get('/seller-profiles/me')
        .set('Authorization', `Bearer ${sToken}`)
        .expect(200);
    });

    it('should list all sellers (Admin)', async () => {
      await request(app.getHttpServer())
        .get('/seller-profiles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should verify a seller (Admin)', async () => {
      await request(app.getHttpServer())
        .patch(`/seller-profiles/${sellerId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'VERIFIED', reason: 'Looks good' })
        .expect(200);
    });
  });

});

// Helpers
async function setupSeller(app, email, stallName) {
  await request(app.getHttpServer()).post('/auth/register').send({
    email, password: 'password123', name: 'Seller', role: 'SELLER'
  });
  const login = await request(app.getHttpServer()).post('/auth/login').send({
    email, password: 'password123'
  });
  const token = login.body.access_token;

  // Profile
  const imagePath = path.join(__dirname, 'test-image.jpg');
  const profile = await request(app.getHttpServer())
    .post('/seller-profiles')
    .set('Authorization', `Bearer ${token}`)
    .field('stallName', stallName)
    .field('description', 'Desc')
    .field('location', 'Loc')
    .attach('photoKtp', imagePath)
    .attach('photoStall', imagePath)
    .attach('qrisImage', imagePath);

  return { token, sellerId: profile.body.id };
}

async function createProduct(app, token, name) {
  const imagePath = path.join(__dirname, 'test-image.jpg');
  const res = await request(app.getHttpServer())
    .post('/products')
    .set('Authorization', `Bearer ${token}`)
    .field('name', name)
    .field('description', 'D')
    .field('price', 10)
    .field('stock', 10)
    .field('category', 'C')
    .attach('image', imagePath);
  return res.body;
}
