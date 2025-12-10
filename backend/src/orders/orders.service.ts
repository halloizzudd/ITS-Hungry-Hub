import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';

import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { sellerId, orderType, items } = createOrderDto;

    // 1. Fetch products to get price and prepTime
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      throw new Error('Some products not found');
    }

    // 2. Calculate Total Amount & Total Prep Time for this order
    let totalAmount = 0;
    let currentOrderPrepTime = 0;

    const orderItemsData = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      currentOrderPrepTime += product.prepTime * item.quantity; // basic assumption: prep time adds up linearly

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // 3. Queue Logic: Calculate Estimated Ready Time
    // Find the latest active order for this seller to determine queue end time
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        sellerId,
        status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
        estimatedReadyAt: { not: null },
      },
      orderBy: { estimatedReadyAt: 'desc' },
    });

    const now = new Date();
    let queueStartTime = now;

    // If there is a queue, and the last order finishes in the future, start after that
    if (lastOrder && lastOrder.estimatedReadyAt && lastOrder.estimatedReadyAt > now) {
      queueStartTime = lastOrder.estimatedReadyAt;
    }

    // Add current order's prep time (in minutes)
    const estimatedReadyAt = new Date(queueStartTime.getTime() + currentOrderPrepTime * 60000);

    // 4. Create Order Transaction
    const order = await this.prisma.order.create({
      data: {
        userId,
        sellerId,
        totalAmount,
        status: 'WAITING_PAYMENT',
        orderType,
        estimatedReadyAt,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: { include: { product: true } },
        user: true, // Include user to get email
        seller: { include: { user: true } }, // Include seller -> user to get seller email
      },
    });

    // Send confirmation email to customer
    if (order.user && order.user.email) {
      await this.mailService.sendOrderConfirmation(order.user as any, order);
    }

    // Send new order alert to seller
    if (order.seller?.user?.email) {
      await this.mailService.sendNewOrderAlert(order.seller.user.email, order);
    }

    return order;
  }

  async uploadPayment(id: number, file: Express.Multer.File) {
    const paymentProofUrl = `uploads/${file.filename}`;
    return this.prisma.order.update({
      where: { id },
      data: {
        paymentProofUrl,
        status: 'WAITING_CONFIRMATION',
      },
    });
  }

  async findAll(user: any) {
    if (user.role === 'SELLER') {
      const sellerProfile = await this.prisma.sellerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!sellerProfile) {
        return [];
      }

      return this.prisma.order.findMany({
        where: { sellerId: sellerProfile.id },
        include: {
          orderItems: {
            include: { product: true },
          },
          user: {
            select: { name: true },
          },
        },
        orderBy: { id: 'desc' },
      });
    } else {
      return this.prisma.order.findMany({
        where: { userId: user.id },
        include: {
          orderItems: {
            include: { product: true },
          },
          seller: {
            select: { stallName: true },
          },
        },
        orderBy: { id: 'desc' },
      });
    }
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
        user: true,
        seller: true,
      },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: { user: true },
    });

    // Send email for significant status updates
    if (updateOrderDto.status && ['PROCESSING', 'READY', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(updateOrderDto.status) && order.user && order.user.email) {
      await this.mailService.sendOrderStatusUpdate(order.user as any, order);
    }

    return order;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
