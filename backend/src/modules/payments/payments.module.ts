import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentSchema } from './schemas/payment.schema';
import { OrderSchema } from '../orders/schemas/order.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { MailModule } from '../mail/mail.module';
import { PaymentEventsListener } from './payment-events.listener';
import { UserSchema } from '../auth/schemas/user.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Payment', schema: PaymentSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Order', schema: OrderSchema },
    ]),
    NotificationsModule,
    MailModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentEventsListener],
  exports: [PaymentsService],
})
export class PaymentsModule {}
