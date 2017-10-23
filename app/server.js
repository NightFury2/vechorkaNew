import Express from 'express';
import morgan from 'morgan';
const log = require('./libs/log.js')(module);
import passport from 'passport';
import { mongoose, UserModel, RefreshTokenModel, AccessTokenModel, ClientModel } from './models/index';
import oauth2 from './oauth2/oauth2';
import config from './config/index.js';
// import jwt from 'jsonwebtoken';// аутентификация по JWT для hhtp
import favicon from 'serve-favicon';
// import session from 'express-session';
import bodyParser from 'body-parser';
import compression from 'compression';
// import httpProxy from 'http-proxy';
import path from 'path';
// import http from 'http';
// import log from './libs/log.js';
import * as actions from './routes/index';
import { mapUrl } from './utils/url.js';
import faker from 'Faker';
import PrettyError from 'pretty-error';
// import http from 'http';
// import SocketIo from 'socket.io';

const pretty = new PrettyError();
const app = new Express();

app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));
app.use(compression());
app.use(bodyParser.json());

if (app.get('env') === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('default'));
}

app.use(passport.initialize());

require('./oauth2/auth');

app.post('/oauth/token', oauth2.token);

app.get('/api/userInfo',
  passport.authenticate('bearer', { session: false }), (req, res) => {
    // req.authInfo is set using the `info` argument supplied by
    // `BearerStrategy`.  It is typically used to indicate scope of the token,
    // and used in access control checks.  For illustrative purposes, this
    // example simply returns the scope in the response.
    res.json({ user_id: req.user.userId, name: req.user.username, scope: req.authInfo.scope });
  }
);
app.get('/api/createUser', (req, res) => {
  UserModel.remove({}, (err) => {
    UserModel.create({ username: 'Jon', password: 'Snow', phone: 'asd', email: 'asdsd' })
      .then( user => {
        res.json({ user: user.username, password: user.password });
      })
      .catch( err => {
        res.json({error: err.message});
      });
  });
  ClientModel.remove({}, err => {
    if (err) return log.error(err);
  });
  AccessTokenModel.remove({}, err => {
    if (err) return log.error(err);
  });
  // RefreshTokenModel.remove({}, err => {
  //   if (err) return log.error(err);
  // });
});

app.use((req, res) => {
  const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);

  const {action, params} = mapUrl(actions, splittedUrlPath);

  if (action) {
    action(req, params)
      .then((result) => {
        if (result instanceof Function) {
          result(res);
        } else {
          res.json(result);
        }
      }, (reason) => {
        if (reason && reason.redirect) {
          res.redirect(reason.redirect);
        } else {
          console.error('API ERROR:', pretty.render(reason));
          res.status(reason.status || 500).json(reason);
        }
      });
  } else {
    res.status(404).end('NOT FOUND');
  }
});

if (config.get('PORT')) {
  const runnable = app.listen(config.get('PORT'), (err) => {
    if (err) {
      log.error(err);
    }
    log.info('----\n==> 🌎  API is running on port %s', config.get('PORT'));
    log.info('==> 💻  Send requests to %s:%s', config.get('HOST'), config.get('PORT'));
  });
} else {
  log.error('==>     ERROR: No PORT environment variable has been specified');
}

// const server = new http.Server(app);

// app.use((req, res) => {
//   const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);
//
//   const {action, params} = mapUrl(actions, splittedUrlPath);
//
//   if (action) {
//     action(req, params)
//       .then((result) => {
//         if (result instanceof Function) {
//           result(res);
//         } else {
//           res.json(result);
//         }
//       }, (reason) => {
//         if (reason && reason.redirect) {
//           res.redirect(reason.redirect);
//         } else {
//           console.error('API ERROR:', pretty.render(reason));
//           res.status(reason.status || 500).json(reason);
//         }
//       });
//   } else {
//     res.status(404).end('NOT FOUND');
//   }
// });


