import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type UserActivityDocument = UserActivity & Document;

@Schema({ timestamps: true })
export class UserActivity {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ required: true })
    action: string; 
    
    @Prop({ required: true })
    description: string; 

    @Prop()
    ipAddress: string;

    @Prop()
    userAgent: string;

    @Prop({ type: Object })
    metadata: Record<string, any>; 
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
