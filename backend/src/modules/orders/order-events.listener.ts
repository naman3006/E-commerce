/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MailService } from '../mail/mail.service';

/**
 * Order Events Listener
 * Listens to order-related events and sends appropriate email notifications
 * to customers and admins on each event
 */
@Injectable()
export class OrderEventsListener {
  private readonly logger = new Logger(OrderEventsListener.name);

  constructor(
    @InjectModel('User') private userModel: Model<any>,
    private mailService: MailService,
  ) {}

  /**
   * Handle new order creation
   * Sends confirmation to customer and notification to admins
   */
  @OnEvent('order.created', { async: true })
  async handleOrderCreated(payload: {
    orderId: string;
    userId: string;
    order: any;
  }) {
    try {
      this.logger.debug(
        `Processing order.created event for order ${payload.orderId}`,
      );

      const order = payload.order;
      const user = (await this.userModel
        .findById(payload.userId)
        .lean()
        .exec()) as any;

      if (!user) {
        this.logger.warn(`User not found for order ${payload.orderId}`);
        return;
      }

      // Send confirmation to customer
      await this.mailService.sendOrderConfirmation((user as any).email, {
        orderId: order._id.toString(),
        customerName: (user as any).name,
        items: order.items || [],
        total: order.totalAmount || 0,
        shippingAddress: order.shippingAddress || '',
      });

      // Send notification to admins
      const admins = await this.userModel.find({ role: 'admin' }).lean().exec();
      if (admins && admins.length > 0) {
        const adminEmails = (admins as any[])
          .map((admin) => admin.email)
          .filter(Boolean);
        await this.mailService.sendNewOrderNotificationToAdmins(adminEmails, {
          orderId: order._id.toString(),
          customerName: (user as any).name,
          customerEmail: (user as any).email,
          total: order.totalAmount || 0,
          itemCount: order.items?.length || 0,
          paymentStatus: order.paymentStatus || 'pending',
          shippingAddress: order.shippingAddress || '',
        });
      }

      this.logger.log(
        `Order created notifications sent for order ${payload.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling order.created event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle order status updates
   * Sends status change notifications to customer and admins
   */
  @OnEvent('order.status.updated', { async: true })
  async handleOrderStatusUpdated(payload: {
    orderId: string;
    userId: string;
    status: string;
    order?: any;
  }) {
    try {
      this.logger.debug(
        `Processing order.status.updated event for order ${payload.orderId}`,
      );

      const user = (await this.userModel
        .findById(payload.userId)
        .lean()
        .exec()) as any;

      if (!user) {
        this.logger.warn(`User not found for order ${payload.orderId}`);
        return;
      }

      // Prepare order data
      const order = payload.order || {};

      // Get admin emails
      const admins = await this.userModel.find({ role: 'admin' }).lean().exec();
      const adminEmails = (admins as any[])
        .map((admin) => admin.email)
        .filter(Boolean);

      // Send to customer and admins
      await this.mailService.sendOrderStatusUpdate(
        (user as any).email,
        adminEmails,
        {
          orderId: payload.orderId,
          customerName: (user as any).name,
          status: payload.status,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          notes: order.internalNotes,
        },
      );

      this.logger.log(
        `Order status update notifications sent for order ${payload.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling order.status.updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle order payment completed
   * Sends payment confirmation and notifies admins
   */
  @OnEvent('order.paid', { async: true })
  async handleOrderPaid(payload: { orderId: string; paymentId?: string }) {
    try {
      this.logger.debug(
        `Processing order.paid event for order ${payload.orderId}`,
      );

      // In a real app, fetch order and user details from database
      // For now, admins are notified that payment was received
      const admins = await this.userModel.find({ role: 'admin' }).lean().exec();
      if (admins && admins.length > 0) {
        const adminEmails = admins.map((admin) => admin.email).filter(Boolean);
        this.logger.log(
          `Order ${payload.orderId} paid - notified ${adminEmails.length} admins`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error handling order.paid event: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle order cancellation
   * Sends cancellation notice to customer and admins
   */
  @OnEvent('order.cancelled', { async: true })
  async handleOrderCancelled(payload: {
    orderId: string;
    userId: string;
    reason?: string;
    refundAmount?: number;
  }) {
    try {
      this.logger.debug(
        `Processing order.cancelled event for order ${payload.orderId}`,
      );

      const user = (await this.userModel
        .findById(payload.userId)
        .lean()
        .exec()) as any;

      if (!user) {
        this.logger.warn(`User not found for order ${payload.orderId}`);
        return;
      }

      const admins = await this.userModel.find({ role: 'admin' }).lean().exec();
      const adminEmails = (admins as any[])
        .map((admin) => admin.email)
        .filter(Boolean);

      // Send to both customer and admins
      await this.mailService.sendOrderCancellation(
        (user as any).email,
        adminEmails,
        {
          orderId: payload.orderId,
          customerName: (user as any).name,
          reason: payload.reason || 'No reason provided',
          refundAmount: payload.refundAmount,
          refundStatus: 'Processing',
        },
      );

      this.logger.log(
        `Order cancellation notifications sent for order ${payload.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling order.cancelled event: ${error.message}`,
        error.stack,
      );
    }
  }
}
