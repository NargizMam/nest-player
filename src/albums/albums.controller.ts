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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumsDto } from './create-albums.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { Roles, RolesGuard } from '../auth/role-auth.guard';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}
  @Get()
  async getAll(@Query('artist') id: string) {
    let albums: CreateAlbumsDto[];
    if (id) {
      albums = await this.albumModel
        .find({ artist: { _id: id } })
        .populate('artist', 'title');
      if (albums) {
        return albums;
      } else {
        throw new Error('У данного исполнителя нет альбомов');
      }
    }
    albums = await this.albumModel.find().populate('artist', 'title');
    if (!albums) {
      throw new Error('Альбомов не найдено!');
    }
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    const selectAlbum = this.albumModel
      .findById(id)
      .populate('artist', 'title');
    if (!selectAlbum) {
      throw new NotFoundException('Альбом не был найден');
    }
    return selectAlbum;
  }

  @Post()
  @UseGuards(TokenAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads/albums/',
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
    @Body() albumsDto: CreateAlbumsDto,
  ) {
    try {
      const newAlbum = new this.albumModel({
        title: albumsDto.title,
        artist: albumsDto.artist,
        issueDate: albumsDto.issueDate,
        description: albumsDto.description,
        image: file ? '/uploads/albums/' + file.filename : null,
      });
      await newAlbum.save();
      return 'Альбом успешно создан!';
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
  deleteAlbum(@Param('id') id: string) {
    const deletedAlbum = this.albumModel.findByIdAndDelete(id);
    if (deletedAlbum) {
      return 'Альбом успешно удален!';
    } else {
      throw new NotFoundException('Исполнитель возможно был удален');
    }
  }
}
