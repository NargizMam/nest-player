import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import mongoose, { Model } from 'mongoose';
import { CreateTrackDto } from './create-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  async getAll(@Query('album') id: string) {
    let tracksList: CreateTrackDto[];
    if (id) {
      tracksList = await this.trackModel.find({ album: { _id: id } }).populate([
        {
          path: 'album',
          select: 'title artist',
          populate: [{ path: 'artist', select: 'title' }],
        },
      ]);
      return tracksList;
    }
    tracksList = await this.trackModel.find().populate('artist', 'title');
    return tracksList;
  }
  @Post()
  async create(@Body() trackDto: CreateTrackDto) {
    try {
      const newTrack = new this.trackModel({
        title: trackDto.title,
        album: trackDto.album,
        duration: trackDto.duration,
        serialNumber: trackDto.serialNumber,
        isPublished: trackDto.isPublished,
      });
      await newTrack.save();
      return 'Трек успешно создан!';
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }
      throw e;
    }
  }
  @Delete(':id')
  async deleteTrack(@Param('id') id: string) {
    const deletedTrack = await this.trackModel.findByIdAndDelete(id);
    if (deletedTrack) {
      return 'Трек успешно удален!';
    } else {
      throw new NotFoundException('Возможно, трек был удален');
    }
  }
}
