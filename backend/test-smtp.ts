// test-smtp.ts
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Load variabel dari file .env
dotenv.config();

async function testSmtpConnection() {
  console.log('🔄 Mencoba menghubungkan ke Gmail SMTP...');
  console.log(`📧 User: ${process.env.MAIL_USER}`);

  // 1. Setup Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false, // true untuk 465, false untuk port lain
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // 2. Verifikasi Koneksi
  try {
    await transporter.verify();
    console.log('✅ KONEKSI SUKSES! Server siap menerima pesan.');
    
    // 3. Coba Kirim Email Test
    console.log('📨 Sedang mencoba mengirim email test...');
    const info = await transporter.sendMail({
      from: `"Test Server" <${process.env.MAIL_USER}>`, // sender address
      to: process.env.MAIL_USER, // kirim ke diri sendiri untuk test
      subject: "Test Koneksi SMTP Sukses", 
      text: "Jika Anda membaca ini, berarti konfigurasi SMTP Node.js Anda sudah benar.", 
      html: "<b>Jika Anda membaca ini, berarti konfigurasi SMTP Node.js Anda sudah benar.</b>", 
    });

    console.log('🚀 Email Terkirim: %s', info.messageId);
    console.log('Cek inbox email Anda sekarang!');

  } catch (error) {
    console.error('❌ KONEKSI GAGAL!');
    console.error('Penyebab Error:', error);
    
    if (error.code === 'EAUTH') {
        console.log('👉 Kemungkinan password salah atau App Password belum aktif.');
    }
  }
}

testSmtpConnection();