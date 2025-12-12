/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
  ) { }

  async findOne(userId: string): Promise<WishlistDocument> {
    let wishlist = await this.wishlistModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('productIds')
      .exec();

    if (!wishlist) {
      wishlist = new this.wishlistModel({
        userId: new Types.ObjectId(userId),
        productIds: [],
      });
      await wishlist.save();
    }
    return wishlist;
  }

  async add(userId: string, productId: string): Promise<WishlistDocument> {
    const updatedWishlist = await this.wishlistModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $addToSet: { productIds: new Types.ObjectId(productId) },
          $setOnInsert: { userId: new Types.ObjectId(userId) }
        },
        { new: true, upsert: true }
      )
      .populate('productIds')
      .exec();

    return updatedWishlist;
  }

  async remove(userId: string, productId: string): Promise<WishlistDocument> {
    const updatedWishlist = await this.wishlistModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $pull: { productIds: new Types.ObjectId(productId) } },
        { new: true }
      )
      .populate('productIds')
      .exec();

    if (!updatedWishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return updatedWishlist;
  }
}
