import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../common/interfaces/user.interface';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;

  @Prop({ type: [{ type: 'ObjectId', ref: 'Address' }] })
  addresses: string[];

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop({ default: null })
  avatar: string;

  @Prop({ default: null })
  phone: string;

  @Prop({ default: null })
  resetPasswordOtp: string | null;

  @Prop({ type: Date, default: null })
  resetPasswordExpires: Date | null;

  @Prop({ default: 0 })
  resetPasswordAttempts: number;

  @Prop({ type: Date, default: null })
  lockUntil: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
