import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Album } from './album.schema';

@Schema()
export class Track {
  @Prop({ ref: Album.name, required: true })
  album: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  serialNumber: number;

  @Prop({ required: true })
  isPublished: boolean;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
export type TrackDocument = Track & Document;
