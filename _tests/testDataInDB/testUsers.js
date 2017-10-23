const log = require('../../app/libs/log.js')(module);
import { UserModel, ClientModel, AccessTokenModel, RefreshTokenModel, mongoose } from '../../app/models/index';
import faker from 'Faker';

UserModel.remove()
  .then(() => {
    let user = new UserModel({ username: 'andrey', password: 'simplepassword' });
    user.save((err, user) => {
      if (err) return log.error(err);
      log.info(`New user - ${user.username}:${user.password}`);
    });

    for(i = 0; i < 4; i++) {
      user = new UserModel({ username: faker.random.first_name().toLowerCase(), password: faker.Lorem.words(1)[0] });
      user.save((err, user) => {
        if (err) return log.error(err);
        log.info(`New user - ${user.username}:${user.password}`);
      });
    }
  })
  .catch((err) => {
    log.error(err);
  });

ClientModel.remove()
  .then(() => {
    const client = new ClientModel({ name: 'OurService iOS client v1', clientId: 'mobileV1', clientSecret: 'abc123456' });
    client.save((err, client) => {
      if (err) return log.error(err);
      log.info(`New client - ${client.clientId}:${client.clientSecret}`);
    });
  })
  .catch((err) => {
    log.error(err);
  });

AccessTokenModel.remove({}, (err) => {
  if (err) return log.error(err);
});
RefreshTokenModel.remove({}, (err) => {
  if (err) return log.error(err);
});

setTimeout(() => {
  mongoose.disconnect();
}, 3000);
