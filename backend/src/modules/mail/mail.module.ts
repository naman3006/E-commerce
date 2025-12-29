import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const isDev = configService.get('NODE_ENV') === 'development';
        const isProduction = configService.get('NODE_ENV') === 'production';
        const mailForceReal = configService.get('MAIL_FORCE_REAL') === 'true';
        const mailUser = configService.get('MAIL_USER');
        const mailPassword = configService.get('MAIL_PASSWORD');

        let transportConfig: any;

        // Logic: Use Ethereal if (Dev AND !ForceReal) OR (No Credentials Provided)
        const useEthereal = (isDev && !mailForceReal) || (!mailUser || !mailPassword);

        if (useEthereal) {
          try {
            console.log('[MailModule] 📧 Configuring Ethereal Email...');
            const testAccount = await nodemailer.createTestAccount();
            transportConfig = {
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass,
              },
            };
            console.log('[MailModule] ✅ Using Ethereal Email for Development');
            console.log(`[MailModule] 👤 Account: ${testAccount.user}`);
            console.log(`[MailModule] 🔑 Password: ${testAccount.pass}`);
          } catch (err) {
            console.error('[MailModule] ❌ Failed to create Ethereal test account', err);
          }
        } else {
          // Use Real SMTP
          transportConfig = {
            host: configService.get('MAIL_HOST', 'smtp.gmail.com'),
            port: configService.get('MAIL_PORT', 587),
            secure: false,
            auth: {
              user: mailUser,
              pass: mailPassword,
            },
          };
          console.log(`[MailModule] 📨 Using Configured SMTP: ${mailUser}`);
        }

        return {
          transport: transportConfig,
          defaults: {
            from: `"${configService.get('MAIL_FROM_NAME', 'VoxMarket')}" <${configService.get('MAIL_FROM', 'noreply@voxmarket.com')}>`,
          },
          template: {
            dir: join(__dirname, '..', '..', 'modules', 'mail', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MailerModule, MailService],
  providers: [MailService],
})
export class MailModule { }
