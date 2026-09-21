import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (name) => {
    const value = process.env[name];
    if (!value || !value.trim()) {
        throw new Error(
            `[config] Missing required environment variable: ${name}. ` +
                `Set it in Backend/.env before starting the server.`,
        );
    }
    return value;
};

const config = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/kirana-store",
    jwtSecret: requiredEnv("JWT_SECRET"),
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15,
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    // Email / SMTP Settings
    emailService: process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE || '',
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim(),
    smtpPass: (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, ''),
    fromEmail: (process.env.FROM_EMAIL || process.env.EMAIL_USER || process.env.SMTP_USER || 'orders@kiranahub.local').trim(),
    fromName: process.env.FROM_NAME || 'KiranaHub Fresh',
    // Google OAuth Settings
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
};

export default config;
