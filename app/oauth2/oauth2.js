import oauth2orize from 'oauth2orize';
import passport from 'passport';
import crypto from 'crypto';
import config from '../config/index.js';
import { UserModel, ClientModel, AccessTokenModel, RefreshTokenModel } from '../models/index';

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password((client, username, password, scope) => {
  return new Promise((resolve, reject) => {
    UserModel.findOne({ username: username }, (err, user) => {
      if (err) reject(err);
      if (!user) reject(null, false);
      if (!user.checkPassword(password)) reject(null, false);

      RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, (err) => {
        if (err) reject(err);
      });
      AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, (err) => {
        if (err) reject(err);
      });

      const tokenValue = crypto.randomBytes(32).toString('base64');
      const refreshTokenValue = crypto.randomBytes(32).toString('base64');
      const token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
      const refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
      refreshToken.save((err) => {
        if (err) reject(err);
      });
      const info = { scope: '*' };
      token.save((err, token) =>{
        if (err) reject(err);
        resolve(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
      });
    });
  });
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope) => {
  return new Promise((resolve, reject) => {
    RefreshTokenModel.findOne({ token: refreshToken }, (err, token) => {
      if (err) reject(err);
      if (!token) reject(null, false);

      UserModel.findById(token.userId, (err, user) => {
        if (err) reject(err);
        if (!user) reject(null, false);

        RefreshTokenModel.remove({ userId: user.userId, clientId: client.clientId }, (err) => {
          if (err) reject(err);
        });
        AccessTokenModel.remove({ userId: user.userId, clientId: client.clientId }, (err) => {
          if (err) reject(err);
        });

        const tokenValue = crypto.randomBytes(32).toString('base64');
        const refreshTokenValue = crypto.randomBytes(32).toString('base64');
        const token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
        const refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
        refreshToken.save((err) => {
          if (err) reject(err);
        });
        const info = { scope: '*' };
        token.save((err, token) => {
          if (err) reject(err);
          resolve(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
        });
      });
    });
  });
}));


// token endpoint
exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler()
];
