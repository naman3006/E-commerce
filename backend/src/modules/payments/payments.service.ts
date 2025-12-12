/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  OrderDocument,
  OrderStatus,
  PaymentStatus,
} from '../orders/schemas/order.schema';
import { NotificationGateway } from '../notifications/notification.gateway';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel('Order') private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
    private notificationGateway: NotificationGateway,
    private mailService: MailService,
  ) {}

  async initiate(orderId: string, userId: string): Promise<any> {
    // Demo; integrate real gateway
    // In a real scenario, you'd verify the order amount here
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Order not found');

    const transactionId = `demo-tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payment = new this.paymentModel({
      orderId: new Types.ObjectId(orderId),
      transactionId,
      amount: order.totalAmount, // Use actual order amount
      status: 'pending',
    });
    await payment.save();
    return {
      paymentId: payment._id,
      gatewayUrl: 'demo-gateway-url',
      transactionId,
    };
  }

  async verify(verifyPaymentDto: VerifyPaymentDto): Promise<PaymentDocument> {
    const payment = await this.paymentModel
      .findOne({ transactionId: verifyPaymentDto.transactionId })
      .exec();
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = verifyPaymentDto.status as any;
    if (payment.status === 'success') payment.paidAt = new Date();
    await payment.save();

    // Fetch order to get user details for email
    const order = await this.orderModel
      .findById(payment.orderId)
      .populate('userId')
      .exec();

    if (order) {
      // Determine email and name
      let email = order.customerEmail;
      let customerName = 'Customer';

      // If user is populated (it comes as an object if populated)
      // We cast to any to access properties safely
      const user = order.userId as any;
      if (user && user.email) {
        if (!email) email = user.email;
        if (user.name) customerName = user.name;
      }

      // Fallback name from shipping address if possible
      // (assuming shippingAddress might be stored differently or we skip parsing for now)

      if (email) {
        // Send email asynchronously without blocking response
        setImmediate(async () => {
          if (payment.status === 'success') {
            await this.mailService.sendPaymentSuccess(email, [], {
              orderId: order._id.toString(),
              customerName,
              transactionId: payment.transactionId,
              amount: payment.amount || order.totalAmount,
              paymentMethod: order.paymentMethod || 'Credit Card',
              orderTotal: order.totalAmount || 0,
              itemCount: order.items ? order.items.length : 0,
            });
          } else if (payment.status === 'failed') {
            await this.mailService.sendPaymentFailed(email, [], {
              orderId: order._id.toString(),
              customerName,
              transactionId: payment.transactionId,
              amount: payment.amount || order.totalAmount,
              errorMessage:
                'Transaction was declined or failed at the gateway.',
            });
          }
        });
      }
    }

    // If payment succeeded, mark order payment and order status
    if (payment.status === 'success') {
      try {
        const updatedOrder = await this.orderModel
          .findByIdAndUpdate(
            payment.orderId,
            {
              paymentStatus: PaymentStatus.paid,
              orderStatus: OrderStatus.confirmed,
              paymentTransactionId: payment.transactionId,
              updatedAt: new Date(),
              $push: {
                statusHistory: {
                  status: OrderStatus.confirmed,
                  timestamp: new Date(),
                },
              },
            },
            { new: true },
          )
          .exec();

        // Emit order.paid event for other listeners (admins, sellers)
        this.eventEmitter.emit('order.paid', {
          orderId: payment.orderId.toString(),
          paymentId: payment._id.toString(),
        });

        // Notify order owner and admins via gateway
        if (updatedOrder && updatedOrder.userId) {
          this.notificationGateway.sendNotificationToUser(
            updatedOrder.userId.toString(),
            {
              type: 'ORDER_PAID',
              payload: { orderId: updatedOrder._id, paymentId: payment._id },
            },
          );
        }
      } catch (err) {
        const logger = new Logger('PaymentsService');
        logger.error(`Failed to update order after payment: ${err.message}`);
      }
    }

    return payment;
  }

  async getStatus(
    orderId: string,
    userId: string,
  ): Promise<PaymentDocument | null> {
    return this.paymentModel
      .findOne({ orderId: new Types.ObjectId(orderId) })
      .exec();
  }
}
