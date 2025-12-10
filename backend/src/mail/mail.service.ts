import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const mailPass = this.configService.get<string>('MAIL_PASS');
        const mailUser = this.configService.get<string>('MAIL_USER') || 'tcizzudd@gmail.com';

        if (!mailPass || mailPass === 'PUT_YOUR_APP_PASSWORD_HERE') {
            this.logger.warn('MAIL_PASS is not set in .env. Email service will be disabled.');
            return;
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: mailUser,
                pass: mailPass,
            },
        });
    }

    async sendOrderConfirmation(userEmail: string, orderId: number, totalAmount: number) {
        const subject = `Order Confirmation #${orderId}`;
        const body = `Thank you for your order. Total: Rp ${totalAmount.toLocaleString('id-ID')}. Status: Waiting for Payment Proof.`;

        // Wrapping text in simple HTML for better presentation, but keeping the core message exactly as requested
        const html = `
            <div style="font-family: Arial, sans-serif;">
                <p>Thank you for your order. Total: Rp ${totalAmount.toLocaleString('id-ID')}. Status: Waiting for Payment Proof.</p>
            </div>
        `;

        await this.sendMail(userEmail, subject, html, body);
    }

    async sendOrderReady(userEmail: string, orderId: number) {
        const subject = `Your Food is Ready! #${orderId}`;
        const body = `Your order is ready at the canteen. Please pick it up.`;

        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h3 style="color: #4CAF50;">Good news!</h3>
                <p>${body}</p>
            </div>
        `;

        await this.sendMail(userEmail, subject, html, body);
    }

    async sendLowStockAlert(sellerEmail: string, productName: string, currentStock: number) {
        const subject = `Low Stock Alert: ${productName}`;
        const body = `Stock is running low (${currentStock} left). Please restock.`;

        const html = `
            <div style="font-family: Arial, sans-serif;">
                <h3 style="color: #FF5722;">⚠️ Low Stock Alert</h3>
                <p>Product: <strong>${productName}</strong></p>
                <p>Stock is running low (<strong>${currentStock}</strong> left). Please restock.</p>
            </div>
        `;

        await this.sendMail(sellerEmail, subject, html, body);
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

    private async sendMail(to: string, subject: string, html: string, text?: string) {
        if (!this.transporter) {
            this.logger.warn(`Email service disabled. Email to ${to} not sent.`);
            return;
        }

        try {
            const info = await this.transporter.sendMail({
                from: '"ITS Hungry Hub" <tcizzudd@gmail.com>',
                to: to,
                subject: subject,
                html: html,
                text: text || html.replace(/<[^>]*>?/gm, ''), // Fallback text
            });

            this.logger.log(`Email sent to ${to}. MessageId: ${info.messageId}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}`, error.stack);
        }
    }
}
