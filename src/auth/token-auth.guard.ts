// import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { User, UserDocument } from '../schemas/user.schema';
// import { Model } from 'mongoose';
//
// @Injectable()
// export class TokenAuthGuard implements CanActivate {
//   constructor(
//     @InjectModel(User.name)
//     private userModel: Model<UserDocument>,
//   ) {}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const headerValue = request.get('Authorization');
//     if (!headerValue) return false;
//
//     const [_bearer, token] = headerValue.split(' ');
//     if (!token) return false;
//     const user = await this.userModel.findOne({ token });
//     if (!user) return false;
//
//     console.log('user', user);
//
//     request.user = user;
//     return true;
//   }
// }

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers?.authorization) return false;

    const [_bearer, token] = request.headers?.authorization.split(' ');
    if (!token) return false;
    const user = await this.userModel.findOne({ token });
    if (!user) return false;

    request.user = user;
    return true;
  }
}