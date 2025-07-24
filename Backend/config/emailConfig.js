// backend/config/emailConfig.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Memuat variabel dari .env

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: parseInt(process.env.BREVO_SMTP_PORT),
        secure: false, // false untuk port 587 (STARTTLS), true untuk port 465 (SSL)
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASSWORD,
        },
        tls: {
            // Ini bisa diperlukan di beberapa lingkungan untuk menghindari sertifikat yang tidak valid
            rejectUnauthorized: false
        }
    });
};

export default createTransporter;