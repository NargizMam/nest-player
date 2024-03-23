import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateArtistsDto } from './create-artists.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { Roles, RolesGuard } from '../auth/role-auth.guard';

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
    const selectArtist = this.artistModel.findById(id);
    if (!selectArtist) {
      throw new NotFoundException('Исполнитель не был найден');
    }
    return selectArtist;
  }

  @Post()
  @UseGuards(TokenAuthGuard)
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
    try {
      const newArtist = new this.artistModel({
        title: artistDto.title,
        description: artistDto.description,
        isPublished: artistDto.isPublished,
        image: file ? '/uploads/artists/' + file.filename : null,
      });
      await newArtist.save();
      return 'Исполнитель успешно создан!';
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }
      throw e;
    }
  }

  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(TokenAuthGuard, RolesGuard)
  async deleteArtist(@Param('id') id: string) {
    const deletedArtist = await this.artistModel.findByIdAndDelete(id);
    if (!deletedArtist) {
      throw new NotFoundException('Исполнитель возможно был удален');
    }
    return 'Исполнитель успешно удален!';
  }
}
