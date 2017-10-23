import mongoose, {Schema} from 'mongoose';

const RefreshTokenSchema = new Schema({
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

class RefreshTokenClass {
}

RefreshTokenSchema.loadClass(RefreshTokenClass);

export const RefreshTokenModel = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshTokenModel;
