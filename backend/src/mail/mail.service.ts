import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const mailPass = this.configService.get<string>('MAIL_PASS');

        if (!mailPass || mailPass === 'PUT_YOUR_APP_PASSWORD_HERE') {
            this.logger.warn('MAIL_PASS is not set in .env. Email service will be disabled.');
            return;
        }

        // Initialize transporter directly
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Using Gmail service as requested (simplifies host/port)
            auth: {
                user: 'tcizzudd@gmail.com', // Hardcoded as requested, or fallback to env
                pass: mailPass, // App Password from Env
            },
        });
    }

    async sendOrderConfirmation(user: { email: string; name: string }, order: any) {
        const subject = `Order Confirmation #${order.id}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5C9E33;">Order Received!</h2>
                <p>Hello ${user.name},</p>
                <p>Thank you for your order at ITS Hungry Hub. We have received your order and it is now <strong>${order.status}</strong>.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Order ID:</strong> #${order.id}</p>
                    <p><strong>Total Amount:</strong> Rp ${order.totalAmount.toLocaleString('id-ID')}</p>
                </div>

                <p>Please upload your payment proof if you haven't already done so via the dashboard.</p>
                <br>
                <p>Best regards,<br>ITS Hungry Hub Team</p>
            </div>
        `;

        await this.sendMail(user.email, subject, html);
    }

    async sendOrderStatusUpdate(user: { email: string; name: string }, order: any) {
        const subject = `Order Status Update #${order.id}`;
        let message = `Your order status has been updated to <strong>${order.status}</strong>.`;

        if (order.status === 'PROCESSING' && order.estimatedReadyAt) {
            const time = new Date(order.estimatedReadyAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            message += `<p><strong>Estimated Ready Time:</strong> ${time}</p>`;
        } else if (order.status === 'READY') {
            message += `<p>Your food is ready! Please pick it up at the stall.</p>`;
        }

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #5C9E33;">Order Update</h2>
                <p>Hello ${user.name},</p>
                <p>${message}</p>
                <br>
                <p>See you soon at the canteen!</p>
            </div>
        `;

        await this.sendMail(user.email, subject, html);
    }

    async sendNewOrderAlert(sellerEmail: string, order: any) {
        const subject = `New Order Alert #${order.id}`;
        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #d9534f;">New Order Received!</h2>
                <p>You have a new order pending confirmation.</p>
                <p><strong>Order ID:</strong> #${order.id}</p>
                <p><strong>Total:</strong> Rp ${order.totalAmount.toLocaleString('id-ID')}</p>
                <p>Please check your dashboard to process this order.</p>
            </div>
        `;

        await this.sendMail(sellerEmail, subject, html);
    }

    async sendLowStockWarning(sellerEmail: string, productName: string, stock: number) {
        const subject = `Low Stock Warning: ${productName}`;
        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #f0ad4e;">Low Stock Alert</h2>
                <p>The stock for <strong>${productName}</strong> is running low.</p>
                <p><strong>Remaining Stock:</strong> ${stock}</p>
                <p>Please restock soon to avoid running out.</p>
            </div>
        `;

        await this.sendMail(sellerEmail, subject, html);
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
        if (!this.transporter) {
            this.logger.warn(`Email service disabled. Email to ${to} not sent.`);
            return;
        }

        try {
            const info = await this.transporter.sendMail({
                from: '"ITS Hungry Hub" <tcizzudd@gmail.com>', // Hardcoded sender as requested
                to: to, // Dynamic recipient
                subject: subject,
                html: html,
            });

            this.logger.log(`Email sent to ${to}. MessageId: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error.stack);
        }
    }
}
