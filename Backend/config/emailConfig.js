import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); 

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: parseInt(process.env.BREVO_SMTP_PORT),
        secure: false, 
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASSWORD,
        },
        tls: {
          
            rejectUnauthorized: false
        }
    });
};

export default createTransporter;