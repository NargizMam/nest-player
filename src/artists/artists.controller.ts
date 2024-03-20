import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateArtistsDto } from './create-artists.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/artists/' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateArtistsDto,
  ) {
    const newArtist = new this.artistModel({
      title: artistDto.title,
      description: artistDto.description,
      isPublished: artistDto.isPublished,
      image: file ? '/uploads/artists/' + file.filename : null,
    });
    return newArtist.save();
  }

  @Delete(':id')
  async deleteArtist(@Param('id') id: string) {
    console.log(id);
    await this.artistModel.findByIdAndDelete(id);
    return 'Исполнитель успешно удален!';
  }
}
