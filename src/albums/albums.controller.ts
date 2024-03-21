import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumsDto } from './create-albums.dto';

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
  async getOne(@Param('id') id: string) {
    const selectAlbum = await this.albumModel
      .findById(id)
      .populate('artist', 'title');
    if (!selectAlbum) {
      throw new Error('Альбо не найден!');
    }
    return selectAlbum;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/albums/' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumsDto: CreateAlbumsDto,
  ) {
    const newAlbum = new this.albumModel({
      title: albumsDto.title,
      artist: albumsDto.artist,
      issueDate: albumsDto.issueDate,
      description: albumsDto.description,
      isPublished: albumsDto.isPublished,
      image: file ? '/uploads/albums/' + file.filename : null,
    });
    await newAlbum.save();
    return 'Альбом успешно создан!';
  }

  @Delete(':id')
  async deleteAlbum(@Param('id') id: string) {
    const deletedAlbum = await this.albumModel.findByIdAndDelete(id);
    if (deletedAlbum) {
      return 'Альбом успешно удален!';
    } else {
      throw new Error('Данный альбом возможно удален!');
    }
  }
}
