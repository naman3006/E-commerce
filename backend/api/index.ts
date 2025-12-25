import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';

let app: NestExpressApplication;

export default async function handler(req: any, res: any) {
    if (!app) {
        app = await NestFactory.create<NestExpressApplication>(AppModule);
        await setupApp(app);
        await app.init();
    }
    const expressApp = app.getHttpAdapter().getInstance();
    return expressApp(req, res);
}
