import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Document from 'mongoose';
import bcrypt from 'bcrypt';

export interface UserMethods {
  generateToken(): void;
  checkPassword(password: string): Promise<boolean>;
}
const SALT_WORK_FACTOR = 10;
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  displayName: string;

  @Prop()
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.generateToken = function () {
  this.token = crypto.randomUUID();
};

UserSchema.methods.checkPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre('save', async function () {
  if (this.isModified('password')) return;

  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});
export type UserDocument = User & Document & UserMethods;
