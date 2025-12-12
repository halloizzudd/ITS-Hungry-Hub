import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  async create(user: any, createProductDto: any, images: Array<Express.Multer.File> = []) {
    // 1. Get Seller Profile
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!seller) {
      throw new BadRequestException('Seller profile not found. Please complete onboarding.');
    }

    // Extract fields
    const { name, description, price, stock, category, prepTime, sku } = createProductDto;

    // Handle Image URLs
    // Main image (for backward compatibility) is the first one
    let imageUrl: string | null = null;
    if (images.length > 0) {
      imageUrl = `uploads/${images[0].filename}`;
    }

    const productImagesData = images.map((file) => ({
      url: `uploads/${file.filename}`,
    }));

    return this.prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        sku,
        prepTime: Number(prepTime || 5),
        imageUrl,
        sellerId: seller.id,
        images: {
          create: productImagesData,
        },
      },
      include: {
        images: true,
      },
    });
  }

  async findAll(params: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page: number;
    limit: number;
  }) {
    const { search, category, minPrice, maxPrice, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } }, // sqlite contains is case-insensitive usually but not always? Prisma Default for SQLite is strict?
        { description: { contains: search } },
        { seller: { stallName: { contains: search } } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          images: true,
          seller: { include: { user: { select: { name: true } } } },
        },
        orderBy: { id: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findAllBySeller(userId: number, params?: any) { // Made params optional
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BadRequestException('Seller profile not found');
    }

    return this.prisma.product.findMany({
      where: { sellerId: seller.id },
      include: {
        images: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto, images: Array<Express.Multer.File> = [], user: any) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: true }
    });

    if (!existingProduct) {
      throw new BadRequestException('Product not found');
    }

    if (existingProduct.seller.userId !== user.id) {
      throw new ForbiddenException('You are not authorized to update this product');
    }

    const data: any = { ...updateProductDto };

    // Handle Image Update
    if (images && images.length > 0) {
      data.imageUrl = `uploads/${images[0].filename}`;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: data,
      include: {
        seller: { include: { user: true } },
      },
    });

    if (images && images.length > 0) {
      const productImagesData = images.map((file) => ({
        url: `uploads/${file.filename}`,
        productId: product.id,
      }));

      await this.prisma.productImage.createMany({
        data: productImagesData,
      });
    }

    if (product.stock < 10 && product.seller?.user?.email) {
      await this.mailService.sendLowStockWarning(product.seller.user.email, product.name, product.stock);
    }

    return product;
  }

  async remove(id: number, user: any) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: true }
    });

    if (!existingProduct) {
      throw new BadRequestException('Product not found');
    }

    if (existingProduct.seller.userId !== user.id) {
      throw new ForbiddenException('You are not authorized to delete this product');
    }

    return this.prisma.product.delete({ where: { id } });
  }
}
