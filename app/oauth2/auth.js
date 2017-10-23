import config from '../config/index.js';
import passport from 'passport';
import {BasicStrategy} from 'passport-http';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { UserModel, ClientModel, AccessTokenModel, RefreshTokenModel } from '../models/index';

passport.use(new BasicStrategy(
  (username, password) => {
    return new Promise((resolve, reject) => {
      ClientModel.findOne({ clientId: username }, (err, client) => {
        if (err) reject(err);
        if (!client) reject(null, false);
        if (client.clientSecret !== password) reject(null, false);

        return resolve(null, client);
      });
    });
  }
));

passport.use(new ClientPasswordStrategy(
  (clientId, clientSecret) => {
    return new Promise((resolve, reject) => {
      ClientModel.findOne({ clientId: clientId }, (err, client) => {
        if (err) reject(err);
        if (!client) reject(null, false);
        if (client.clientSecret !== clientSecret) reject(null, false);

        return resolve(null, client);
      });
    });
  }
));

passport.use(new BearerStrategy(
  (accessToken) => {
    return new Promise((resolve, reject) => {
      AccessTokenModel.findOne({ token: accessToken }, (err, token) => {
        if (err) reject(err);
        if (!token) reject(null, false);

        if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife') ) {
          AccessTokenModel.remove({ token: accessToken }, (err) => {
            if (err) reject(err);
          });

          return resolve(null, false, { message: 'Token expired' });
        }

        UserModel.findById(token.userId, (err, user) => {
          if (err) reject(err);
          if (!user) reject(null, false, { message: 'Unknown user' });

          const info = { scope: '*' };
          resolve(null, user, info);
        });
      });
    });
  }
));
