import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });
    }

    async sendOrderConfirmation(customerEmail: string, orderData: any) {
        const subject = `Order Confirmation #${orderData.id}`;
        const total = Number(orderData.totalAmount).toLocaleString('id-ID');
        const body = `
            <h3>Thank you for your order!</h3>
            <p>Order ID: <strong>#${orderData.id}</strong></p>
            <p>Total: <strong>Rp ${total}</strong></p>
            <p>Status: ${orderData.status}</p>
            <p>We have received your order and it is being processed.</p>
        `;
        await this.sendMail(customerEmail, subject, body);
    }

    async sendNewOrderAlert(sellerEmail: string, orderData: any) {
        const subject = `New Order Received #${orderData.id}`;
        const total = Number(orderData.totalAmount).toLocaleString('id-ID');
        const body = `
            <h3>You have a new order!</h3>
            <p>Order ID: <strong>#${orderData.id}</strong></p>
            <p>Total: <strong>Rp ${total}</strong></p>
            <p>Please check your dashboard to process this order.</p>
        `;
        await this.sendMail(sellerEmail, subject, body);
    }

    async sendOrderStatusUpdate(customerEmail: string, orderId: string, status: string) {
        const subject = `Order Status Update #${orderId}`;
        const body = `
            <h3>Order Status Update</h3>
            <p>Your order <strong>#${orderId}</strong> status has changed to: <strong>${status}</strong></p>
        `;
        await this.sendMail(customerEmail, subject, body);
    }

    async sendLowStockWarning(sellerEmail: string, productName: string, currentStock: number) {
        const subject = `Low Stock Alert: ${productName}`;
        const body = `
            <h3>⚠️ Low Stock Warning</h3>
            <p>Product: <strong>${productName}</strong></p>
            <p>Current Stock: <strong>${currentStock}</strong></p>
            <p>Please restock immediately.</p>
        `;
        await this.sendMail(sellerEmail, subject, body);
    }

    async sendWelcomeEmail(userEmail: string, userName: string) {
        const subject = `Selamat Datang di ITS Hungry Hub!`;
        const body = `
            <h3>Halo, ${userName}!</h3>
            <p>Terima kasih telah mendaftar di <strong>ITS Hungry Hub</strong>.</p>
            <p>Akun Anda telah berhasil dibuat. Silakan login untuk mulai memesan makanan favorit Anda di kantin ITS.</p>
            <br>
            <p>Salam hangat,<br>Tim ITS Hungry Hub</p>
        `;
        await this.sendMail(userEmail, subject, body);
    }

    async sendWeeklySalesReport(sellerEmail: string, reportData: any) {
        const subject = `Weekly Sales Report`;
        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #5bc0de;">Weekly Sales Summary</h2>
                <p>Here is your sales performance for the past week:</p>
                <ul>
                    <li><strong>Total Orders:</strong> ${reportData.totalOrders}</li>
                    <li><strong>Total Revenue:</strong> Rp ${reportData.totalRevenue.toLocaleString('id-ID')}</li>
                </ul>
                <p>Keep up the great work!</p>
            </div>
        `;
        await this.sendMail(sellerEmail, subject, html);
    }

    private async sendMail(to: string, subject: string, html: string) {
        try {
            const mailOptions = {
                from: `"ITS Hungry Hub" <${this.configService.get<string>('MAIL_USER')}>`,
                to,
                subject,
                html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent: ${info.messageId} to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error.stack);
            // Don't throw error to prevent blocking the main flow
        }
    }
}
