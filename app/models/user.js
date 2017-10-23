import mongoose, {Schema, Model} from 'mongoose';
import crypto from 'crypto';

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  nickName: String,
  username: {
    type: String,
    required: 'Укажите username',
    unique: 'Username занят'
  },
  email: {
    type: String,
    required: 'Укажите e-mail',
    unique: 'E-mail уже занят'
  },
  phone: {
    type: String,
    required: 'Укажите phone',
    unique: 'Phone занят'
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  type: {
    type: Array,
    default: 'user'
  }
});

class UserClass {
  encryptPassword(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    // more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
  }

  get userId() {
    return this.id;
  }

  set password(password) {
    this._plainPassword = password;
    this.salt = crypto.randomBytes(32).toString('base64');
    // more secure - this.salt = crypto.randomBytes(128).toString('base64');
    this.hashedPassword = this.encryptPassword(password);
  }

  get password() {
    console.log(this);
    return this._plainPassword;
  }

  checkPassword(password) {
    return this.encryptPassword(password) === this.hashedPassword;
  }
}

UserSchema.loadClass(UserClass);

export const UserModel = mongoose.model('User', UserSchema);

module.export = UserModel;
