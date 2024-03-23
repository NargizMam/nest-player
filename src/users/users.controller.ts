import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { RegisterUserDto } from './register-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/uploads/users/',
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
  async registerUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    try {
      console.log(registerUserDto);
      const user = new this.userModel({
        email: registerUserDto.email,
        password: registerUserDto.password,
        displayName: registerUserDto.displayName,
        avatar: file ? 'uploads/users/' + file.filename : null,
      });
      user.generateToken();
      await user.save();
      return { message: 'Регистрация прошла успешно!', user };
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }
      throw e;
    }
  }
  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  async login(@Req() req: Request) {
    return req.user;
  }

  @Delete()
  async logout(@Req() req: Request) {
    const headerValue = req.get('Authorization');
    const successMessage = { message: 'Success!' };
    if (!headerValue) {
      return { ...successMessage };
    }
    const [_bearer, token] = headerValue.split(' ');
    if (!token) {
      return { ...successMessage };
    }
    const user = await this.userModel.findOne({ token });
    if (!user) {
      return { ...successMessage };
    }
    user.generateToken();
    await user.save();
    return { ...successMessage, stage: 'Success' };
  }
}
