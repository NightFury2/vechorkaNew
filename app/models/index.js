import {UserModel} from './user';
import {ClientModel} from './client';
import {AccessTokenModel} from './accessToken';
import {RefreshTokenModel} from './refreshToken';
import config from '../config';

import mongoose from 'mongoose';
const log = require('../libs/log')(module);

mongoose.Promise = Promise; // Просим Mongoose использовать стандартные Промисы
mongoose.set('debug', true);  // Просим Mongoose писать все запросы к базе в консоль. Удобно для отладки кода
mongoose.connect(config.get('mongoose:uri'));
const db = mongoose.connection;

db.on('error', (err) => {
  log.error('connection error:', err.message);
});
db.once('open', () => {
  log.info('Connected to DB!');
});

module.exports.mongoose = mongoose;
module.exports.UserModel = UserModel;
module.exports.ClientModel = ClientModel;
module.exports.AccessTokenModel = AccessTokenModel;
module.exports.RefreshTokenModel = RefreshTokenModel;
