import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async findMy(userId: string): Promise<AddressDocument[]> {
    return this.addressModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async create(
    createAddressDto: CreateAddressDto,
    userId: string,
  ): Promise<AddressDocument> {
    const address = new this.addressModel({
      ...createAddressDto,
      userId: new Types.ObjectId(userId),
    });
    return address.save();
  }

  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
    userId: string,
  ): Promise<AddressDocument> {
    const address = await this.addressModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateAddressDto,
        { new: true },
      )
      .exec();
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.addressModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      })
      .exec();
    if (result.deletedCount === 0)
      throw new NotFoundException('Address not found');
  }
}
