import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CreateArtistsDto } from "./create-artists.dto";
@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}
  @Get()
  getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.artistModel.findById(id);
  }

  @Post()
  async create(@Body() artistDto: CreateArtistsDto) {
    const newArtist = new this.artistModel({
      title: artistDto.title,
      description: artistDto.description,
      isPublished: artistDto.isPublished,
    });
    return newArtist.save();
  }
}
