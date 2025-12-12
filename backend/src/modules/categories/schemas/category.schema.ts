import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  image: string;

  @Prop()
  slug: string; // URL-friendly name

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId: Types.ObjectId; // For subcategories

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // For sorting categories

  @Prop()
  icon: string; // Icon class or URL

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Object })
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Add indexes
CategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ name: 'text', description: 'text' });
