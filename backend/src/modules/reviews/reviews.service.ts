import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<ReviewDocument> {
    const review = new this.reviewModel({
      ...createReviewDto,
      userId: new Types.ObjectId(createReviewDto.userId),
      productId: new Types.ObjectId(createReviewDto.productId),
    });
    return review.save();
  }

  async findByProduct(productId: string): Promise<ReviewDocument[]> {
    return this.reviewModel
      .find({ productId: new Types.ObjectId(productId) })
      .populate('userId')
      .exec();
  }

  async remove(id: string): Promise<void> {
    const result = await this.reviewModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Review not found');
  }
}
