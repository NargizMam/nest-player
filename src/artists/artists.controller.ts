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
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  getAll() {
    const allArtist = this.artistModel.find();
    if (!allArtist) {
      throw new Error('Исполнители не найдены');
    }
    return allArtist;
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    const selectArtist = this.artistModel.findById(id);
    if (!selectArtist) {
      throw new Error('Исполнитель не был найден');
    }
    return selectArtist;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/artists/',
        filename: (_req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
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
    await newArtist.save();
    return 'Исполнитель успешно создан!';
  }

  @Delete(':id')
  async deleteArtist(@Param('id') id: string) {
    const deletedArtist = await this.artistModel.findByIdAndDelete(id);
    if (!deletedArtist) {
      throw new Error('Исполнитель возможно был удален');
    }
    return 'Исполнитель успешно удален!';
  }
}
