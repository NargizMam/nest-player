import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Artist {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string | null;

  @Prop({ required: true, default: false })
  isPublished: boolean;

  @Prop()
  image: string;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);
export type ArtistDocument = Artist & Document;
