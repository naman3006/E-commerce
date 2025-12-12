/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';

/**
 * Payment Events Listener
 * Listens to payment-related events and sends email notifications
 * to customers and admins
 */
@Injectable()
export class PaymentEventsListener {
  private readonly logger = new Logger(PaymentEventsListener.name);

  constructor(
    @InjectModel('User') private userModel: Model<any>,
    @InjectModel('Order') private orderModel: Model<any>,
    @InjectModel('Payment') private paymentModel: Model<any>,
    private mailService: MailService,
  ) {}

  /**
   * Handle successful payment
   * Sends confirmation email to customer and notification to admins
   */
  @OnEvent('payment.success', { async: true })
  async handlePaymentSuccess(payload: {
    orderId: string;
    paymentId: string;
    transactionId: string;
    amount: number;
  }) {
    try {
      this.logger.debug(
        `Processing payment.success event for order ${payload.orderId}`,
      );

      // Fetch order and user
      const order: any = await this.orderModel
        .findById(payload.orderId)
        .populate('userId')
        .lean()
        .exec();

      if (!order) {
        this.logger.warn(`Order not found for payment ${payload.paymentId}`);
        return;
      }

      const user = order.userId;

      if (!user || !user.email) {
        this.logger.warn(`User email not found for order ${payload.orderId}`);
        return;
      }

      // Get admin emails
      const admins = await this.userModel.find({ role: 'admin' }).lean().exec();
      const adminEmails = ((admins || []) as any[])
        .map((admin) => admin.email)
        .filter(Boolean);

      // Send payment success notification
      await this.mailService.sendPaymentSuccess(user.email, adminEmails, {
        orderId: payload.orderId,
        customerName: (user as any).name,
        transactionId: payload.transactionId,
        amount: payload.amount,
        paymentMethod: (order as any).paymentMethod || 'Card',
        orderTotal: (order as any).totalAmount || 0,
        itemCount: (order as any).items?.length || 0,
      });

      this.logger.log(
        `Payment success notifications sent for order ${payload.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling payment.success event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle failed payment
   * Sends failure notification to customer and alerts admins
   */
  @OnEvent('payment.failed', { async: true })
  async handlePaymentFailed(payload: {
    orderId: string;
    paymentId: string;
    transactionId: string;
    amount: number;
    errorMessage: string;
    attemptNumber?: number;
  }) {
    try {
      this.logger.debug(
        `Processing payment.failed event for order ${payload.orderId}`,
      );

      // Fetch order and user
      const order: any = await this.orderModel
        .findById(payload.orderId)
        .populate('userId')
        .lean()
        .exec();

      if (!order) {
        this.logger.warn(`Order not found for payment ${payload.paymentId}`);
        return;
      }

      const user = order.userId;

      if (!user || !user.email) {
        this.logger.warn(`User email not found for order ${payload.orderId}`);
        return;
      }

      // Get admin emails
      const admins = await this.userModel.find({ role: 'admin' }).lean().exec();
      const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

      // Send payment failure notification
      await this.mailService.sendPaymentFailed(user.email, adminEmails, {
        orderId: payload.orderId,
        customerName: user.name,
        transactionId: payload.transactionId,
        amount: payload.amount,
        errorMessage: payload.errorMessage,
        attemptNumber: payload.attemptNumber,
      });

      this.logger.log(
        `Payment failure notifications sent for order ${payload.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling payment.failed event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle refund processed
   * Sends refund confirmation to customer
   */
  @OnEvent('payment.refunded', { async: true })
  async handlePaymentRefunded(payload: {
    orderId: string;
    paymentId: string;
    refundAmount: number;
    reason: string;
  }) {
    try {
      this.logger.debug(
        `Processing payment.refunded event for order ${payload.orderId}`,
      );

      const order: any = await this.orderModel
        .findById(payload.orderId)
        .populate('userId')
        .lean()
        .exec();

      if (!order) {
        this.logger.warn(`Order not found for refund ${payload.paymentId}`);
        return;
      }

      const user = order.userId;

      if (!user || !user.email) {
        this.logger.warn(`User email not found for order ${payload.orderId}`);
        return;
      }

      // Log refund event
      this.logger.log(
        `Refund processed for order ${payload.orderId} - Amount: ${payload.refundAmount}, Reason: ${payload.reason}`,
      );

      // In production, send refund confirmation email
      // For now, just log the event
    } catch (error) {
      this.logger.error(
        `Error handling payment.refunded event: ${error.message}`,
        error.stack,
      );
    }
  }
}
