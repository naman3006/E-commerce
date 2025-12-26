import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
    I18nValidationExceptionFilter,
    i18nValidationErrorFactory,
} from 'nestjs-i18n';
import { TransFormInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SocketAdapter } from './common/adapters/socket.adapter';
import { join } from 'path';

export function setupApp(app: NestExpressApplication) {
    // Serve static files (for uploaded images) - Only if not in limited serverless env without persistent storage
    // But we keep it for compatibility if they rely on it for pre-seeded assets
    const uploadPath = join(process.cwd(), 'uploads');
    app.useStaticAssets(uploadPath, {
        prefix: '/uploads/',
    });

    // Enable CORS
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:3000',
                'http://localhost:5173',
                'http://localhost:5174', // Often used by Vite
                'https://voxmarket-backend-o8bv.onrender.com',
            ];

            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow Vercel deployments (including previews)
            if (origin.endsWith('.vercel.app')) {
                return callback(null, true);
            }

            // Allow local network IP access for mobile testing
            if (origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
                return callback(null, true);
            }

            // Defensively allow all for now if strict check fails, to debug, 
            // OR strictly fail. Given the error, strict failing is better than invalid * response.
            // But let's log it just in case.
            console.log('Blocked CORS origin:', origin);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: false,
            forbidNonWhitelisted: false,
            transform: true,
            exceptionFactory: i18nValidationErrorFactory,
        }),
    );

    app.useGlobalInterceptors(new TransFormInterceptor());
    app.useGlobalFilters(
        new HttpExceptionFilter(),
        new I18nValidationExceptionFilter({ detailedErrors: false }),
    );

    // Note: WebSockets might not work in Vercel/Netlify Serverless functions
    // We keep it here, but it might just be ignored or fail gracefully if the environment doesn't support upgrading
    try {
        app.useWebSocketAdapter(new SocketAdapter(app));
    } catch (e) {
        console.warn('WebSocket adapter could not be initialized (expected in serverless):', e);
    }
}
