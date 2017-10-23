import mongoose, {Schema} from 'mongoose';

const AccessTokenSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

class AccessTokenClass {}

AccessTokenSchema.loadClass(AccessTokenClass);

export const AccessTokenModel = mongoose.model('AccessToken', AccessTokenSchema);
